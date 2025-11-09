import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { subscribePush } from '@/lib/push'
import { pushSubscriptionSchema, validate } from '@/lib/validation'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'



export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth()
    const body = await request.json()
    
    // Validation
    const validation = validate(pushSubscriptionSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { subscription } = validation.data
    
    // Trouver le membre actif de l'utilisateur
    const member = await prisma.groupMember.findFirst({
      where: {
        userId,
        status: 'JOINED',
      },
    })
    
    if (!member) {
      return NextResponse.json(
        { error: 'Aucun membre actif trouvé' },
        { status: 404 }
      )
    }
    
    const userAgent = request.headers.get('user-agent') || undefined
    
    await subscribePush(member.id, subscription, userAgent)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

