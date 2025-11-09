import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'
import { generateJoinCode } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { joinCodeSchema, validate } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const limit = rateLimit(`join:${ip}`, 5, 60000) // 5 tentatives par minute
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((limit.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': limit.resetAt.toString(),
          },
        }
      )
    }
    
    const body = await request.json()
    const validation = validate(joinCodeSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { code } = validation.data
    
    // Trouver le membre avec ce code (optimisé avec select)
    const member = await prisma.groupMember.findUnique({
      where: { joinCode: code.toUpperCase() },
      select: {
        id: true,
        groupId: true,
        status: true,
        userId: true,
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            passwordSetAt: true,
          },
        },
      },
    })
    
    if (!member) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 404 }
      )
    }
    
    // Créer ou récupérer l'utilisateur
    let user = member.user
    
    if (!user) {
      // Créer un utilisateur minimal et mettre à jour le membre en une transaction
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            displayName: `Membre ${member.id.slice(0, 8)}`, // Temporaire, sera mis à jour
          },
        })
        
        await tx.groupMember.update({
          where: { id: member.id },
          data: {
            userId: newUser.id,
            status: 'JOINED',
            joinedAt: new Date(),
          },
        })
        
        return newUser
      })
      
      user = result
    } else {
      // Mettre à jour le statut si nécessaire
      if (member.status !== 'JOINED') {
        await prisma.groupMember.update({
          where: { id: member.id },
          data: {
            status: 'JOINED',
            joinedAt: new Date(),
          },
        })
      }
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
    console.error('Join error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

