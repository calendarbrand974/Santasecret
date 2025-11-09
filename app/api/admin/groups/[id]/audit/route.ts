import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(params.id)
    
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const where: any = {
      groupId: params.id,
    }
    
    if (action) {
      where.action = action
    }
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actorUser: {
            select: {
              displayName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ])
    
    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        actorName: log.actorUser?.displayName || 'Système',
        actorEmail: log.actorUser?.email || null,
        payload: log.payload,
        createdAt: log.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

