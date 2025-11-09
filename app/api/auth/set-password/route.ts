import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/rbac'
import { hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setPasswordSchema, validate } from '@/lib/validation'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'



export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth()
    const body = await request.json()
    
    // Validation
    const validation = validate(setPasswordSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { password } = validation.data
    
    const passwordHash = await hashPassword(password)
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordSetAt: new Date(),
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

