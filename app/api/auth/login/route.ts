import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { loginSchema, validate } from '@/lib/validation'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const limit = rateLimit(`login:${ip}`, 5, 60000) // 5 tentatives par minute
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((limit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      )
    }
    
    const body = await request.json()
    
    // Validation
    const validation = validate(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { email, password } = validation.data
    
    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        displayName: true,
        passwordSetAt: true,
        groupMembers: {
          where: { status: 'JOINED' },
          select: {
            id: true,
            groupId: true,
            role: true,
          },
          take: 1,
          orderBy: {
            joinedAt: 'desc',
          },
        },
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }
    
    // Vérifier si l'utilisateur a un mot de passe
    if (!user.passwordHash || !user.passwordSetAt) {
      return NextResponse.json(
        { error: 'Aucun mot de passe défini. Utilisez votre code de participation.' },
        { status: 401 }
      )
    }
    
    // Vérifier le mot de passe
    const isValid = await verifyPassword(password, user.passwordHash)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }
    
    // Trouver le membre actif
    const member = user.groupMembers[0]
    
    if (!member) {
      return NextResponse.json(
        { error: 'Aucun groupe trouvé pour cet utilisateur' },
        { status: 404 }
      )
    }
    
    // Créer la session
    await createSession(user.id, member.id)
    
    // Vérifier si le profil est complet
    const needsProfile = !user.email ||
                         !user.displayName ||
                         user.displayName.startsWith('Membre') ||
                         !user.passwordSetAt
    
    return NextResponse.json({
      success: true,
      userId: user.id,
      groupId: member.groupId,
      needsProfile,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

