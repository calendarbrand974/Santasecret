import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { generateJoinCode } from '@/lib/auth'
import { validate } from '@/lib/validation'
import { z } from 'zod'
import { sanitizeString } from '@/lib/sanitize'
import { sendEmail } from '@/lib/email'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'

const createMemberSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  email: z.string().email().max(255).optional().nullable(),
  coupleKey: z.string().max(100).optional().nullable(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(params.id)
    
    const members = await prisma.groupMember.findMany({
      where: { groupId: params.id },
      include: {
        user: true,
        wishlist: {
          select: {
            freeText: true,
            items: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    
    return NextResponse.json({
      members: members.map(m => {
        const items = (m.wishlist?.items as any[]) || []
        const itemsCount = items.filter((item: any) => item.title?.trim() !== '').length
        const totalBudget = items.reduce((sum: number, item: any) => sum + (item.estimatedPrice || 0), 0)
        
        return {
          id: m.id,
          displayName: m.user?.displayName || 'Non connecté',
          email: m.user?.email || null,
          role: m.role,
          status: m.status,
          joinCode: m.joinCode,
          joinedAt: m.joinedAt?.toISOString(),
          coupleKey: m.coupleKey,
          wishlist: m.wishlist ? {
            freeText: m.wishlist.freeText || '',
            items: items,
            itemsCount,
            totalBudget,
            updatedAt: m.wishlist.updatedAt?.toISOString(),
          } : null,
        }
      }),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(params.id)
    
    const body = await request.json()
    const validation = validate(createMemberSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const data = validation.data
    
    // Générer un code de participation unique
    const joinCode = await generateJoinCode()
    
    // Créer ou réutiliser l'utilisateur si displayName ou email est fourni
    let userId: string | undefined = undefined
    if (data.displayName || data.email) {
      if (data.email) {
        const emailTrimmed = sanitizeString(data.email).trim()
        
        // Vérifier si l'email est déjà utilisé
        const existingUser = await prisma.user.findUnique({
          where: { email: emailTrimmed },
          include: {
            groupMembers: true,
          },
        })
        
        if (existingUser) {
          // Si l'utilisateur existe mais n'a plus de membres, on peut le réutiliser
          if (existingUser.groupMembers.length > 0) {
            return NextResponse.json(
              { error: 'Cet email est déjà utilisé par un membre actif' },
              { status: 400 }
            )
          }
          
          // Réutiliser l'utilisateur existant
          userId = existingUser.id
          // Mettre à jour le nom si fourni
          if (data.displayName) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { displayName: sanitizeString(data.displayName).trim() },
            })
          }
        } else {
          // Créer un nouvel utilisateur
          const userData: any = {
            email: emailTrimmed,
          }
          if (data.displayName) {
            userData.displayName = sanitizeString(data.displayName).trim()
          } else {
            userData.displayName = `Membre ${joinCode.slice(0, 8)}`
          }
          
          const user = await prisma.user.create({
            data: userData,
          })
          userId = user.id
        }
      } else if (data.displayName) {
        // Pas d'email mais un nom fourni
        const userData: any = {
          displayName: sanitizeString(data.displayName).trim(),
        }
        
        const user = await prisma.user.create({
          data: userData,
        })
        userId = user.id
      }
    }
    
    // Récupérer les informations du groupe pour l'email
    const group = await prisma.group.findUnique({
      where: { id: params.id },
    })
    
    // Créer le membre
    const member = await prisma.groupMember.create({
      data: {
        groupId: params.id,
        userId: userId,
        role: data.role || 'MEMBER',
        status: 'INVITED',
        joinCode,
        coupleKey: data.coupleKey ? sanitizeString(data.coupleKey).trim() : null,
      },
      include: {
        user: true,
      },
    })
    
    // Envoyer l'email d'invitation si un email est fourni
    if (member.user?.email) {
      try {
        await sendEmail({
          to: member.user.email,
          template: 'invitation',
          data: {
            displayName: member.user.displayName || 'Cher/Chère participant(e)',
            groupName: group?.name || 'Secret Santa',
            joinCode: member.joinCode,
            openAt: group?.openAt?.toISOString(),
            timeZone: group?.timeZone,
          },
          userId: member.user.id,
        })
      } catch (emailError) {
        // Ne pas bloquer la création du membre si l'email échoue
        console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', emailError)
      }
    }
    
    return NextResponse.json({
      member: {
        id: member.id,
        displayName: member.user?.displayName || 'Non connecté',
        email: member.user?.email || null,
        role: member.role,
        status: member.status,
        joinCode: member.joinCode,
        joinedAt: member.joinedAt?.toISOString(),
        coupleKey: member.coupleKey,
      },
    })
  } catch (error: any) {
    console.error('Create member error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}
