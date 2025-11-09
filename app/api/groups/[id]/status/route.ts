import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDrawOpen } from '@/lib/tz'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: params.id },
    })
    
    if (!group) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
    }
    
    const open = isDrawOpen(new Date(group.openAt), group.timeZone)
    
    return NextResponse.json({
      openAt: group.openAt.toISOString(),
      timeZone: group.timeZone,
      isOpen: open,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

