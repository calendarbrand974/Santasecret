import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, auditLog } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAdmin(params.id)
    
    // Log d'audit
    await auditLog('ADMIN_VIEW_ALL', {
      groupId: params.id,
      actorUserId: userId,
    })
    
    // Récupérer le dernier draw (le plus récent) pour ce groupe
    const latestDraw = await prisma.draw.findFirst({
      where: { groupId: params.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
    
    // Si aucun draw n'existe, retourner une liste vide
    if (!latestDraw) {
      return NextResponse.json({
        assignments: [],
      })
    }
    
    // Récupérer uniquement les assignations du dernier draw
    const assignments = await prisma.assignment.findMany({
      where: { 
        groupId: params.id,
        drawId: latestDraw.id, // Filtrer par le dernier draw uniquement
      },
      include: {
        giver: {
          include: { user: true },
        },
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
      orderBy: { createdAt: 'asc' },
    })
    
    return NextResponse.json({
      assignments: assignments.map(a => {
        const items = (a.receiver.wishlist?.items as any[]) || []
        const itemsCount = items.filter((item: any) => item.title?.trim() !== '').length
        const totalBudget = items.reduce((sum: number, item: any) => sum + (item.estimatedPrice || 0), 0)
        
        return {
          id: a.id,
          giverId: a.giverId,
          giverName: a.giver.user?.displayName || 'Inconnu',
          receiverId: a.receiverId,
          receiverName: a.receiver.user?.displayName || 'Inconnu',
          revealedAt: a.revealedAt?.toISOString(),
          receiverWishlist: a.receiver.wishlist ? {
            freeText: a.receiver.wishlist.freeText || '',
            items: items,
            itemsCount,
            totalBudget,
            updatedAt: a.receiver.wishlist.updatedAt?.toISOString(),
          } : null,
        }
      }),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

