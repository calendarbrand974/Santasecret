import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateResetToken } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { forgotPasswordSchema, validate } from '@/lib/validation'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'

// Désactiver la mise en cache (évite SSG/ISR)
export const revalidate = 0





export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const limit = rateLimit(`forgot-password:${ip}`, 3, 3600000) // 3 par heure
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    
    // Validation
    const validation = validate(forgotPasswordSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { email } = validation.data
    
    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    // Ne pas révéler si l'email existe ou non (sécurité)
    if (user) {
      const { token, hash, expiry } = await generateResetToken()
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: hash,
          resetTokenExpiry: expiry,
        },
      })
      
      // Envoyer l'email
      await sendEmail({
        to: email,
        template: 'password_reset',
        data: { token },
        userId: user.id,
      })
    }
    
    // Toujours retourner success pour ne pas révéler si l'email existe
    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

