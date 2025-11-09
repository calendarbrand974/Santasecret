import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { profileSchema, validate } from '@/lib/validation'
import { sanitizeString } from '@/lib/sanitize'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'

// Désactiver la mise en cache (évite SSG/ISR)
export const revalidate = 0





export async function GET(
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
          select: {
            id: true,
            displayName: true,
            email: true,
            emailVerified: true,
            passwordSetAt: true,
            createdAt: true,
            updatedAt: true,
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
    
    if (!member.user) {
      return NextResponse.json(
        { error: 'Utilisateur non associé à ce membre' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      user: {
        ...member.user,
        createdAt: member.user.createdAt.toISOString(),
        updatedAt: member.user.updatedAt.toISOString(),
      },
      member: {
        id: member.id,
        role: member.role,
        status: member.status,
        joinCode: member.joinCode,
        joinedAt: member.joinedAt?.toISOString(),
        coupleKey: member.coupleKey,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

export async function PUT(
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
        user: true,
      },
    })
    
    if (!member || !member.user) {
      return NextResponse.json(
        { error: 'Membre ou utilisateur non trouvé' },
        { status: 404 }
      )
    }
    
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
          id: { not: member.user.id },
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
      where: { id: member.user.id },
      data: {
        displayName: displayName.trim(),
        email: email?.trim() || null,
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        emailVerified: true,
        passwordSetAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    
    return NextResponse.json({
      success: true,
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

