import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { validate } from '@/lib/validation'
import { z } from 'zod'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'

// Désactiver la mise en cache (évite SSG/ISR)
export const revalidate = 0



const createForbiddenPairSchema = z.object({
  giverId: z.string(),
  receiverId: z.string(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(params.id)
    
    const forbiddenPairs = await prisma.forbiddenPair.findMany({
      where: { groupId: params.id },
      include: {
        giver: {
          include: { user: true },
        },
        receiver: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({
      forbiddenPairs: forbiddenPairs.map(fp => ({
        id: fp.id,
        giverId: fp.giverId,
        giverName: fp.giver.user?.displayName || 'Inconnu',
        receiverId: fp.receiverId,
        receiverName: fp.receiver.user?.displayName || 'Inconnu',
        createdAt: fp.createdAt.toISOString(),
      })),
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
    const validation = validate(createForbiddenPairSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const data = validation.data
    
    // Vérifier que les membres existent et appartiennent au groupe
    const [giver, receiver] = await Promise.all([
      prisma.groupMember.findFirst({
        where: { id: data.giverId, groupId: params.id },
        include: { user: true },
      }),
      prisma.groupMember.findFirst({
        where: { id: data.receiverId, groupId: params.id },
        include: { user: true },
      }),
    ])
    
    if (!giver || !receiver) {
      return NextResponse.json(
        { error: 'Membre(s) non trouvé(s)' },
        { status: 404 }
      )
    }
    
    // Vérifier que ce sont bien deux membres différents
    // Comparer les IDs de membres (GroupMember.id)
    if (giver.id === receiver.id) {
      console.error('Forbidden pair validation error - Same member ID:', {
        requestedGiverId: data.giverId,
        requestedReceiverId: data.receiverId,
        foundGiverId: giver.id,
        foundReceiverId: receiver.id,
        giverUserId: giver.userId,
        receiverUserId: receiver.userId,
      })
      return NextResponse.json(
        { error: 'Un membre ne peut pas être interdit avec lui-même' },
        { status: 400 }
      )
    }
    
    // Log pour débogage
    console.log('Creating forbidden pair:', {
      giverId: giver.id,
      giverName: giver.user?.displayName || 'Inconnu',
      receiverId: receiver.id,
      receiverName: receiver.user?.displayName || 'Inconnu',
    })
    
    // Vérifier si la paire existe déjà
    const existing = await prisma.forbiddenPair.findFirst({
      where: {
        groupId: params.id,
        giverId: data.giverId,
        receiverId: data.receiverId,
      },
    })
    
    if (existing) {
      return NextResponse.json(
        { error: 'Cette paire interdite existe déjà' },
        { status: 400 }
      )
    }
    
    const forbiddenPair = await prisma.forbiddenPair.create({
      data: {
        groupId: params.id,
        giverId: data.giverId,
        receiverId: data.receiverId,
      },
      include: {
        giver: {
          include: { user: true },
        },
        receiver: {
          include: { user: true },
        },
      },
    })
    
    return NextResponse.json({
      forbiddenPair: {
        id: forbiddenPair.id,
        giverId: forbiddenPair.giverId,
        giverName: forbiddenPair.giver.user?.displayName || 'Inconnu',
        receiverId: forbiddenPair.receiverId,
        receiverName: forbiddenPair.receiver.user?.displayName || 'Inconnu',
        createdAt: forbiddenPair.createdAt.toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

