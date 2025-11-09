import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'

// Désactiver la mise en cache (évite SSG/ISR)
export const revalidate = 0





export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; pairId: string } }
) {
  try {
    await requireAdmin(params.id)
    
    // Vérifier que la paire appartient au groupe
    const forbiddenPair = await prisma.forbiddenPair.findFirst({
      where: {
        id: params.pairId,
        groupId: params.id,
      },
    })
    
    if (!forbiddenPair) {
      return NextResponse.json(
        { error: 'Paire interdite non trouvée' },
        { status: 404 }
      )
    }
    
    await prisma.forbiddenPair.delete({
      where: { id: params.pairId },
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

