import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, auditLog } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { generateMatching, partialRematch, generateSeed } from '@/lib/matching'
import { rematchSchema, validate } from '@/lib/validation'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAdmin(params.id)
    
    const body = await request.json()
    
    // Validation
    const validation = validate(rematchSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { givers } = validation.data
    
    // Récupérer le groupe et les membres (optimisé avec select)
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        members: {
          where: { status: 'JOINED' },
          select: {
            id: true,
            coupleKey: true,
          },
        },
        forbiddenPairs: {
          select: {
            giverId: true,
            receiverId: true,
          },
        },
        assignments: {
          select: {
            id: true,
            giverId: true,
            receiverId: true,
            draw: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })
    
    if (!group) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
    }
    
    // Récupérer le draw actuel
    const currentDraw = group.assignments[0]?.draw
    
    if (!currentDraw) {
      return NextResponse.json(
        { error: 'Aucun tirage trouvé' },
        { status: 404 }
      )
    }
    
    // Construire les données pour le matching
    const allMembers = group.members
    const existingMatches = new Map<string, string>()
    
    for (const assignment of group.assignments) {
      if (!givers.includes(assignment.giverId)) {
        // Conserver les matches non touchés
        existingMatches.set(assignment.giverId, assignment.receiverId)
      }
    }
    
    const giversToRematch = allMembers.filter(m => givers.includes(m.id))
    const allGivers = allMembers.map(m => ({
      id: m.id,
      coupleKey: m.coupleKey || undefined,
    }))
    const allReceivers = allMembers.map(m => ({
      id: m.id,
      coupleKey: m.coupleKey || undefined,
    }))
    
    const forbiddenEdges = group.forbiddenPairs.map(fp => ({
      giverId: fp.giverId,
      receiverId: fp.receiverId,
    }))
    
    // Générer le rematch
    const newSeed = generateSeed()
    const newMatching = partialRematch(
      existingMatches,
      givers,
      allGivers,
      allReceivers,
      forbiddenEdges,
      newSeed
    )
    
    if (!newMatching) {
      return NextResponse.json(
        { error: 'Impossible de générer un nouveau matching avec les contraintes' },
        { status: 400 }
      )
    }
    
    // Supprimer les anciennes assignations à ré-appairer
    await prisma.assignment.deleteMany({
      where: {
        groupId: params.id,
        giverId: { in: givers },
      },
    })
    
    // Créer les nouvelles assignations
    for (const giverId of givers) {
      const receiverId = newMatching.get(giverId)
      if (receiverId) {
        await prisma.assignment.create({
          data: {
            groupId: params.id,
            drawId: currentDraw.id,
            giverId,
            receiverId,
          },
        })
      }
    }
    
    // Log d'audit
    await auditLog('ADMIN_REMATCH', {
      groupId: params.id,
      actorUserId: userId,
      payload: { givers, seed: newSeed },
    })
    
    return NextResponse.json({
      success: true,
      matching: Array.from(newMatching.entries()).map(([giverId, receiverId]) => ({
        giverId,
        receiverId,
      })),
    })
  } catch (error: any) {
    console.error('Rematch error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

