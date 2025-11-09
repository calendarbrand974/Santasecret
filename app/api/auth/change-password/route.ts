import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/rbac'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { changePasswordSchema, validate } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth()
    const body = await request.json()
    
    // Validation
    const validation = validate(changePasswordSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { currentPassword, newPassword } = validation.data
    
    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Aucun mot de passe défini' },
        { status: 400 }
      )
    }
    
    // Vérifier le mot de passe actuel
    const isValid = await verifyPassword(currentPassword, user.passwordHash)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      )
    }
    
    // Mettre à jour avec le nouveau mot de passe
    const newPasswordHash = await hashPassword(newPassword)
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
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

