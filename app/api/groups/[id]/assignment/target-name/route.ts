import { NextRequest, NextResponse } from 'next/server'
import { requireGroupMember } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { isDrawOpen } from '@/lib/tz'

/**
 * Récupère le nom du Gâté secret SANS révéler l'assignation dans la DB
 * Utilisé pour afficher le scratch card avant la révélation officielle
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { groupMemberId } = await requireGroupMember(params.id)
    
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
    
    // Trouver l'assignation (même si pas encore révélée)
    const assignment = await prisma.assignment.findFirst({
      where: {
        groupId: params.id,
        giverId: groupMemberId,
      },
      include: {
        receiver: {
          include: {
            user: true,
            wishlist: {
              select: {
                freeText: true,
                items: true,
                updatedAt: true,
              },
            },
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
    
    // Retourner le nom et la wishlist (sans révéler dans la DB)
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

