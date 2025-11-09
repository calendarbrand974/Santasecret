import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, auditLog } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { generateMatching, generateSeed } from '@/lib/matching'
import { sendPushToGroup } from '@/lib/push'
import { sendEmail } from '@/lib/email'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'

// Désactiver la mise en cache (évite SSG/ISR)
export const revalidate = 0





/**
 * Déclenche manuellement le tirage au sort pour un groupe
 * Accessible uniquement aux admins
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[DRAW TRIGGER] Début de la requête pour le groupe:', params.id)
  try {
    console.log('[DRAW TRIGGER] Vérification des droits admin...')
    const { userId } = await requireAdmin(params.id)
    console.log('[DRAW TRIGGER] Admin vérifié, userId:', userId)
    
    // Récupérer le groupe avec tous les membres et paires interdites
    console.log('[DRAW TRIGGER] Récupération du groupe depuis la base de données...')
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: { user: true },
        },
        forbiddenPairs: true,
        draws: {
          where: { status: 'GENERATED' },
          take: 1,
        },
      },
    })
    
    console.log('[DRAW TRIGGER] Groupe récupéré:', group ? `trouvé avec ${group.members.length} membres` : 'non trouvé')
    
    if (!group) {
      console.log('[DRAW TRIGGER] Erreur: Groupe non trouvé')
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
    }
    
    // Supprimer les tirages existants et leurs assignations
    // ⚠️ ATTENTION : Cela supprime TOUT, y compris :
    // - Toutes les assignations (paires)
    // - Toutes les révélations (revealedAt, revealedByIp, revealedByUa)
    // - Le compteur de révélations
    // Les membres devront révéler à nouveau leur Gâté secret
    console.log('[DRAW TRIGGER] Vérification des tirages existants:', group.draws.length)
    if (group.draws.length > 0) {
      console.log('[DRAW TRIGGER] Suppression des tirages existants...')
      for (const draw of group.draws) {
        // Supprimer les assignations associées (cela supprime aussi toutes les révélations)
        await prisma.assignment.deleteMany({
          where: { drawId: draw.id },
        })
        // Supprimer le draw
        await prisma.draw.delete({
          where: { id: draw.id },
        })
      }
      console.log('[DRAW TRIGGER] Anciens tirages supprimés (assignations et révélations incluses)')
    }
    
    // Vérifier qu'il y a au moins 2 membres
    console.log('[DRAW TRIGGER] Nombre de membres:', group.members.length)
    if (group.members.length < 2) {
      console.log('[DRAW TRIGGER] Erreur: Pas assez de membres')
      return NextResponse.json(
        { error: 'Il faut au moins 2 membres pour faire un tirage' },
        { status: 400 }
      )
    }
    
    // Générer le matching
    console.log('[DRAW TRIGGER] Génération du matching...')
    const givers = group.members.map(m => ({
      id: m.id,
      coupleKey: m.coupleKey || undefined,
    }))
    const receivers = group.members.map(m => ({
      id: m.id,
      coupleKey: m.coupleKey || undefined,
    }))
    
    const forbiddenEdges = group.forbiddenPairs.map(fp => ({
      giverId: fp.giverId,
      receiverId: fp.receiverId,
    }))
    
    const seed = generateSeed()
    console.log('[DRAW TRIGGER] Seed généré:', seed)
    const matching = generateMatching(givers, receivers, forbiddenEdges, seed)
    
    console.log('[DRAW TRIGGER] Matching généré:', matching ? `${matching.size} paires` : 'null')
    if (!matching) {
      console.log('[DRAW TRIGGER] Erreur: Impossible de générer un matching')
      return NextResponse.json(
        { error: 'Impossible de générer un matching avec les contraintes actuelles. Vérifiez les paires interdites.' },
        { status: 400 }
      )
    }
    
    // Créer le draw
    console.log('[DRAW TRIGGER] Création du draw dans la base de données...')
    const draw = await prisma.draw.create({
      data: {
        groupId: group.id,
        status: 'GENERATED',
        seed,
      },
    })
    
    // Créer les assignations
    console.log('[DRAW TRIGGER] Création des assignations...')
    const assignments = []
    for (const [giverId, receiverId] of matching.entries()) {
      assignments.push({
        groupId: group.id,
        drawId: draw.id,
        giverId,
        receiverId,
      })
    }
    
    console.log('[DRAW TRIGGER] Création des assignations dans la base de données...', assignments.length, 'assignations')
    await prisma.assignment.createMany({
      data: assignments,
    })
    
    console.log('[DRAW TRIGGER] Assignations créées avec succès')
    
    // Enregistrer dans l'audit log
    await auditLog('DRAW_TRIGGERED', {
      groupId: group.id,
      actorUserId: userId,
      payload: {
        drawId: draw.id,
        assignmentsCount: assignments.length,
        seed,
      },
    })
    
    console.log('[DRAW TRIGGER] Tirage créé avec succès, drawId:', draw.id, 'assignments:', assignments.length)
    
    // Retourner la réponse immédiatement
    const response = NextResponse.json({
      success: true,
      message: 'Tirage au sort déclenché avec succès',
      drawId: draw.id,
      assignmentsCount: assignments.length,
    })
    
    console.log('[DRAW TRIGGER] Réponse JSON créée, envoi des notifications en arrière-plan...')
    
    // Envoyer les notifications en arrière-plan (ne pas bloquer la réponse)
    Promise.all([
      sendPushToGroup(
        group.id,
        'C\'est l\'heure du tirage !',
        'Le Secret Santa est maintenant ouvert. Découvrez votre Gâté secret !',
        { type: 'draw_opened', groupId: group.id }
      ).catch(err => {
        console.error('Erreur lors de l\'envoi des notifications push:', err.message)
        // Ne pas bloquer, continuer avec les emails
      }),
      // Envoyer des emails aux membres
      ...group.members
        .filter(m => m.user?.email)
        .map(member => 
          sendEmail({
            to: member.user!.email!,
            template: 'assignment_revealed',
            data: {
              displayName: member.user!.displayName,
              targetName: 'Découvrez votre Gâté secret',
            },
            userId: member.user!.id,
          }).catch(err => {
            console.error(`Erreur envoi email à ${member.user!.email}:`, err.message)
          })
        ),
    ]).catch(err => {
      console.error('Erreur lors de l\'envoi des notifications:', err.message)
      // Ne pas bloquer, le tirage est déjà créé
    })
    
    return response
  } catch (error: any) {
    console.error('Trigger draw error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

