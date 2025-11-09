import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { randomBytes } from 'crypto'

const SESSION_COOKIE_NAME = 'santasecret_session'
const CSRF_COOKIE_NAME = 'santasecret_csrf'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 jours

export interface SessionData {
  userId: string
  groupMemberId?: string
  groupId?: string
  role?: 'ADMIN' | 'MEMBER'
}

/**
 * Crée une session pour un utilisateur
 */
export async function createSession(userId: string, groupMemberId?: string): Promise<string> {
  const sessionToken = randomBytes(32).toString('hex')
  const csrfToken = randomBytes(32).toString('hex')
  
  // TODO: Stocker la session dans Redis ou une table Session
  // Pour l'instant, on stocke l'userId dans un cookie séparé
  // En production, utiliser un store de sessions (Redis, DB, etc.)
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
  
  cookieStore.set('santasecret_userid', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
  
  if (groupMemberId) {
    cookieStore.set('santasecret_memberid', groupMemberId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    })
  }
  
  cookieStore.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Accessible en JS pour Double Submit
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
  
  return sessionToken
}

/**
 * Récupère la session actuelle
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!sessionToken) {
    return null
  }
  
  // TODO: Récupérer depuis Redis/DB
  // Pour l'instant, on va chercher l'utilisateur actif via un autre moyen
  // On va utiliser un cookie séparé avec l'userId (temporaire)
  const userId = cookieStore.get('santasecret_userid')?.value
  
  if (!userId) {
    return null
  }
  
  const memberId = cookieStore.get('santasecret_memberid')?.value
  
  // Si on a un memberId, récupérer directement les infos du membre (plus rapide)
  if (memberId) {
    const member = await prisma.groupMember.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        userId: true,
        groupId: true,
        role: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    })
    
    if (member && member.userId === userId) {
      return {
        userId: member.userId!,
        groupMemberId: member.id,
        groupId: member.groupId,
        role: member.role as 'ADMIN' | 'MEMBER',
      }
    }
  }
  
  // Sinon, chercher le premier membre actif (avec select minimal)
  const member = await prisma.groupMember.findFirst({
    where: {
      userId,
      status: 'JOINED',
    },
    select: {
      id: true,
      groupId: true,
      role: true,
    },
  })
  
  if (!member) {
    return null
  }
  
  return {
    userId,
    groupMemberId: member.id,
    groupId: member.groupId,
    role: member.role as 'ADMIN' | 'MEMBER',
  }
}

/**
 * Supprime la session
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(CSRF_COOKIE_NAME)
  cookieStore.delete('santasecret_userid')
  cookieStore.delete('santasecret_memberid')
}

/**
 * Vérifie le token CSRF
 */
export async function verifyCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies()
  const csrfToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
  return csrfToken === token
}

/**
 * Obtient le token CSRF actuel
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null
}

