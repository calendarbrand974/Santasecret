import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, auditLog } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'



export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; giverId: string } }
) {
  try {
    const { userId } = await requireAdmin(params.id)
    
    // Trouver l'assignation
    const assignment = await prisma.assignment.findFirst({
      where: {
        groupId: params.id,
        giverId: params.giverId,
      },
    })
    
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignation non trouvée' },
        { status: 404 }
      )
    }
    
    // Supprimer l'assignation
    await prisma.assignment.delete({
      where: { id: assignment.id },
    })
    
    // Log d'audit
    await auditLog('ADMIN_DELETE_PAIR', {
      groupId: params.id,
      actorUserId: userId,
      payload: { assignmentId: assignment.id, giverId: params.giverId },
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

