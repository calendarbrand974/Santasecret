import { NextRequest, NextResponse } from 'next/server'
import { requireGroupMember } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { isDrawOpen } from '@/lib/tz'
import { auditLog } from '@/lib/rbac'
import { sendPushNotification } from '@/lib/push'
import { sendEmail } from '@/lib/email'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'

// Désactiver la mise en cache (évite SSG/ISR)
export const revalidate = 0





export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { groupMemberId, userId } = await requireGroupMember(params.id)
    
    const group = await prisma.group.findUnique({
      where: { id: params.id },
    })
    
    if (!group) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
    }
    
    // Vérifier que le tirage est ouvert
    if (!isDrawOpen(new Date(group.openAt), group.timeZone)) {
      return NextResponse.json(
        { error: 'Le tirage n\'est pas encore ouvert' },
        { status: 403 }
      )
    }
    
    // Trouver l'assignation
    const assignment = await prisma.assignment.findFirst({
      where: {
        groupId: params.id,
        giverId: groupMemberId,
      },
      include: {
        receiver: {
          include: {
            user: true,
            wishlist: true,
          },
        },
      },
    })
    
    if (!assignment) {
      return NextResponse.json(
        { error: 'Aucune assignation trouvée' },
        { status: 404 }
      )
    }
    
    // Si déjà révélée, retourner les données
    if (assignment.revealedAt) {
      return NextResponse.json({
        name: assignment.receiver.user?.displayName || 'Inconnu',
        wishlist: assignment.receiver.wishlist ? {
          freeText: assignment.receiver.wishlist.freeText,
          items: assignment.receiver.wishlist.items,
          updatedAt: assignment.receiver.wishlist.updatedAt.toISOString(),
        } : undefined,
      })
    }
    
    // Révéler l'assignation
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const ua = request.headers.get('user-agent') || 'unknown'
    
    await prisma.assignment.update({
      where: { id: assignment.id },
      data: {
        revealedAt: new Date(),
        revealedByIp: ip,
        revealedByUa: ua,
      },
    })
    
    // Mettre à jour le compteur de révélations
    await prisma.draw.update({
      where: { id: assignment.drawId },
      data: {
        revealedCount: { increment: 1 },
      },
    })
    
    // Log d'audit
    await auditLog('MEMBER_REVEAL', {
      groupId: params.id,
      actorUserId: userId,
      payload: { assignmentId: assignment.id, receiverId: assignment.receiverId },
    })
    
    // Envoyer notification
    const member = await prisma.groupMember.findUnique({
      where: { id: groupMemberId },
      include: { user: true },
    })
    
    if (member?.user) {
      await sendPushNotification(
        groupMemberId,
        'Votre cible a été révélée !',
        `Vous offrez un cadeau à ${assignment.receiver.user?.displayName || 'votre cible'}`,
        { type: 'assignment_revealed', groupId: params.id }
      )
      
      if (member.user.email) {
        await sendEmail({
          to: member.user.email,
          template: 'assignment_revealed',
          data: {
            displayName: member.user.displayName,
            targetName: assignment.receiver.user?.displayName || 'votre Gâté secret',
          },
          userId: member.user.id,
        })
      }
    }
    
    return NextResponse.json({
      name: assignment.receiver.user?.displayName || 'Inconnu',
      wishlist: assignment.receiver.wishlist ? {
        freeText: assignment.receiver.wishlist.freeText,
        items: assignment.receiver.wishlist.items,
        updatedAt: assignment.receiver.wishlist.updatedAt.toISOString(),
      } : undefined,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

