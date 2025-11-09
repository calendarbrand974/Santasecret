import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { profileSchema, validate } from '@/lib/validation'
import { sanitizeString } from '@/lib/sanitize'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth()
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        email: true,
        emailVerified: true,
        passwordSetAt: true,
        createdAt: true,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await requireAuth()
    const body = await request.json()
    
    // Validation
    const validation = validate(profileSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    // Sanitization
    let { displayName, email } = validation.data
    displayName = sanitizeString(displayName)
    if (email) {
      email = sanitizeString(email)
    }
    
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      })
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        )
      }
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: displayName.trim(),
        email: email?.trim() || null,
      },
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

