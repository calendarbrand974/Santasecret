import { NextRequest, NextResponse } from 'next/server'
import { requireGroupMember } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { isDrawOpen } from '@/lib/tz'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'

// Désactiver la mise en cache (évite SSG/ISR)
export const revalidate = 0





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
    
    // Trouver l'assignation révélée
    const assignment = await prisma.assignment.findFirst({
      where: {
        groupId: params.id,
        giverId: groupMemberId,
        revealedAt: { not: null },
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
        { error: 'Aucune assignation trouvée ou non révélée' },
        { status: 404 }
      )
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

