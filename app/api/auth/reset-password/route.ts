import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { resetPasswordSchema, validate } from '@/lib/validation'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'

// Désactiver la mise en cache (évite SSG/ISR)
export const revalidate = 0





export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    const validation = validate(resetPasswordSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { token, password } = validation.data
    
    // Trouver l'utilisateur avec un token valide
    const users = await prisma.user.findMany({
      where: {
        resetTokenHash: { not: null },
        resetTokenExpiry: { gte: new Date() },
      },
    })
    
    let user = null
    for (const u of users) {
      if (u.resetTokenHash && await verifyPassword(token, u.resetTokenHash)) {
        user = u
        break
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }
    
    // Mettre à jour le mot de passe
    const passwordHash = await hashPassword(password)
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordSetAt: new Date(),
        resetTokenHash: null,
        resetTokenExpiry: null,
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

