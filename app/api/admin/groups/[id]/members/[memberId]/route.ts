import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'



export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    await requireAdmin(params.id)
    
    // Vérifier que le membre appartient au groupe
    const member = await prisma.groupMember.findFirst({
      where: {
        id: params.memberId,
        groupId: params.id,
      },
      include: {
        user: {
          include: {
            groupMembers: true,
          },
        },
      },
    })
    
    if (!member) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }
    
    // Vérifier qu'on ne supprime pas le dernier admin
    if (member.role === 'ADMIN') {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId: params.id,
          role: 'ADMIN',
        },
      })
      
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Impossible de supprimer le dernier administrateur' },
          { status: 400 }
        )
      }
    }
    
    const userId = member.userId
    
    // Supprimer le membre (cascade supprimera wishlist, assignments, etc.)
    await prisma.groupMember.delete({
      where: { id: params.memberId },
    })
    
    // Si l'utilisateur existe et n'a plus d'autres membres, on le supprime aussi
    if (userId && member.user) {
      const remainingMembers = await prisma.groupMember.count({
        where: { userId },
      })
      
      if (remainingMembers === 0) {
        // L'utilisateur n'a plus de membres, on peut le supprimer
        await prisma.user.delete({
          where: { id: userId },
        })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete member error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

