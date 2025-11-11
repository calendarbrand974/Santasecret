import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { validate } from '@/lib/validation'
import { localDateTimeStringToUTC } from '@/lib/tz'
import { z } from 'zod'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'

// Désactiver la mise en cache (évite SSG/ISR)
export const revalidate = 0



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
    
    // Récupérer le timeZone actuel ou le nouveau pour la conversion
    const currentGroup = await prisma.group.findUnique({
      where: { id: params.id },
      select: { timeZone: true },
    })
    const targetTimeZone = data.timeZone || currentGroup?.timeZone || 'UTC'
    
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.timeZone) updateData.timeZone = data.timeZone
    if (data.openAt) {
      // Si openAt est une string ISO datetime complète, l'utiliser directement
      // Sinon, supposer que c'est une date locale dans le timeZone du groupe
      const openAtStr = data.openAt
      if (openAtStr.includes('T') && (openAtStr.includes('Z') || openAtStr.includes('+') || openAtStr.includes('-'))) {
        // C'est déjà une date ISO avec timezone, utiliser directement
        updateData.openAt = new Date(openAtStr)
      } else {
        // C'est une date locale, convertir en UTC selon le timeZone
        updateData.openAt = localDateTimeStringToUTC(openAtStr, targetTimeZone)
      }
    }
    
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

