import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'



export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    await requireAdmin(params.id)
    
    // Récupérer le membre avec ses informations
    const member = await prisma.groupMember.findUnique({
      where: { id: params.memberId },
      include: {
        user: true,
        group: true,
      },
    })
    
    if (!member) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }
    
    if (!member.user?.email) {
      return NextResponse.json(
        { error: 'Ce membre n\'a pas d\'email associé' },
        { status: 400 }
      )
    }
    
    // Envoyer l'email d'invitation
    try {
      await sendEmail({
        to: member.user.email,
        template: 'invitation',
        data: {
          displayName: member.user.displayName || 'Cher/Chère participant(e)',
          groupName: member.group.name || 'Secret Santa',
          joinCode: member.joinCode,
          openAt: member.group.openAt?.toISOString(),
          timeZone: member.group.timeZone,
        },
        userId: member.user.id,
      })
      
      return NextResponse.json({
        success: true,
        message: 'Email d\'invitation renvoyé avec succès',
      })
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Resend invitation error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

