import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { validate } from '@/lib/validation'
import { z } from 'zod'

const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timeZone: z.string().optional(),
  openAt: z.string().datetime().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(params.id)
    
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        timeZone: true,
        openAt: true,
      },
    })
    
    if (!group) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      group: {
        ...group,
        openAt: group.openAt.toISOString(),
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
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(params.id)
    
    const body = await request.json()
    const validation = validate(updateGroupSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const data = validation.data
    
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.timeZone) updateData.timeZone = data.timeZone
    if (data.openAt) updateData.openAt = new Date(data.openAt)
    
    const group = await prisma.group.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        timeZone: true,
        openAt: true,
      },
    })
    
    return NextResponse.json({
      group: {
        ...group,
        openAt: group.openAt.toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

