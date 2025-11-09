import { hash, verify } from 'argon2'
import { randomBytes } from 'crypto'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return hash(password)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await verify(hashedPassword, password)
  } catch {
    return false
  }
}

export async function generateResetToken(): Promise<{ token: string; hash: string; expiry: Date }> {
  const token = randomBytes(32).toString('hex')
  const hash = await hashPassword(token) // On utilise hashPassword pour hasher le token
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 heure
  return { token, hash, expiry }
}

export async function generateMagicLinkToken(): Promise<{ token: string; hash: string; expiry: Date }> {
  const token = randomBytes(32).toString('hex')
  const hash = await hashPassword(token)
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
  return { token, hash, expiry }
}

export async function generateJoinCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  // Vérifier l'unicité
  const existing = await prisma.groupMember.findUnique({
    where: { joinCode: code }
  })
  
  if (existing) {
    return generateJoinCode() // Récursif si collision
  }
  
  return code
}

