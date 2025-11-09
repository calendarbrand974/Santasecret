import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateMatching, generateSeed } from '@/lib/matching'
import { isDrawOpen } from '@/lib/tz'
import { sendPushToGroup } from '@/lib/push'
import { sendEmail } from '@/lib/email'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'



/**
 * Job d'ouverture du tirage
 * À appeler via cron ou manuellement avec un secret
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret (en production, utiliser une clé plus sécurisée)
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== process.env.JOB_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Trouver tous les groupes dont le tirage doit s'ouvrir
    const now = new Date()
    const groups = await prisma.group.findMany({
      where: {
        openAt: { lte: now },
      },
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
    
    let processed = 0
    
    for (const group of groups) {
      // Vérifier que le tirage est vraiment ouvert dans le fuseau horaire
      if (!isDrawOpen(new Date(group.openAt), group.timeZone)) {
        continue
      }
      
      // Vérifier qu'il n'y a pas déjà un draw
      if (group.draws.length > 0) {
        continue
      }
      
      // Générer le matching
      const members = group.members
      if (members.length < 2) {
        continue
      }
      
      const givers = members.map(m => ({
        id: m.id,
        coupleKey: m.coupleKey || undefined,
      }))
      const receivers = members.map(m => ({
        id: m.id,
        coupleKey: m.coupleKey || undefined,
      }))
      
      const forbiddenEdges = group.forbiddenPairs.map(fp => ({
        giverId: fp.giverId,
        receiverId: fp.receiverId,
      }))
      
      const seed = generateSeed()
      const matching = generateMatching(givers, receivers, forbiddenEdges, seed)
      
      if (!matching) {
        console.error(`Impossible de générer un matching pour le groupe ${group.id}`)
        continue
      }
      
      // Créer le draw
      const draw = await prisma.draw.create({
        data: {
          groupId: group.id,
          status: 'GENERATED',
          seed,
        },
      })
      
      // Créer les assignations
      const assignments = []
      for (const [giverId, receiverId] of matching.entries()) {
        assignments.push({
          groupId: group.id,
          drawId: draw.id,
          giverId,
          receiverId,
        })
      }
      
      await prisma.assignment.createMany({
        data: assignments,
      })
      
      // Envoyer les notifications
      await sendPushToGroup(
        group.id,
        'C\'est l\'heure du tirage !',
        'Le Secret Santa est maintenant ouvert. Découvrez votre cible !',
        { type: 'draw_opened', groupId: group.id }
      )
      
      // Envoyer des emails aux membres qui n'ont pas de push
      for (const member of members) {
        if (member.user?.email) {
          await sendEmail({
            to: member.user.email,
            template: 'assignment_revealed',
            data: {
              displayName: member.user.displayName,
              targetName: 'Découvrez votre Gâté secret',
            },
            userId: member.user.id,
          })
        }
      }
      
      processed++
    }
    
    return NextResponse.json({
      success: true,
      processed,
      message: `${processed} groupe(s) traité(s)`,
    })
  } catch (error: any) {
    console.error('Open draw job error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

