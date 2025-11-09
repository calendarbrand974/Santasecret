import { getSession } from './session'
import { prisma } from './prisma'

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function requireAuth(): Promise<{ userId: string }> {
  const session = await getSession()
  if (!session || !session.userId) {
    throw new Error('Unauthorized')
  }
  return { userId: session.userId }
}

/**
 * Vérifie si l'utilisateur est membre d'un groupe
 */
export async function requireGroupMember(groupId: string): Promise<{ userId: string; groupMemberId: string; role: 'ADMIN' | 'MEMBER' }> {
  const session = await getSession()
  if (!session || !session.userId) {
    throw new Error('Unauthorized')
  }
  
  // Si la session contient déjà le groupId et groupMemberId, on peut les utiliser directement
  if (session.groupId === groupId && session.groupMemberId) {
    return {
      userId: session.userId,
      groupMemberId: session.groupMemberId,
      role: session.role || 'MEMBER',
    }
  }
  
  // Sinon, chercher le membre (cas où l'utilisateur a plusieurs groupes)
  const member = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId: session.userId,
      status: 'JOINED',
    },
    select: {
      id: true,
      role: true,
    },
  })
  
  if (!member) {
    throw new Error('Forbidden: Not a member of this group')
  }
  
  return {
    userId: session.userId,
    groupMemberId: member.id,
    role: member.role as 'ADMIN' | 'MEMBER',
  }
}

/**
 * Vérifie si l'utilisateur est admin d'un groupe
 */
export async function requireAdmin(groupId: string): Promise<{ userId: string; groupMemberId: string }> {
  const { role, ...rest } = await requireGroupMember(groupId)
  
  if (role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }
  
  return rest
}

/**
 * Crée un log d'audit
 */
export async function auditLog(
  action: 'ADMIN_VIEW_ALL' | 'ADMIN_DELETE_PAIR' | 'ADMIN_REMATCH' | 'MEMBER_REVEAL' | 'MEMBER_UPDATE_WISHLIST' | 'MEMBER_JOIN' | 'MEMBER_SET_PASSWORD' | 'DRAW_TRIGGERED',
  options: {
    groupId?: string
    actorUserId?: string
    payload?: any
  }
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action,
      groupId: options.groupId,
      actorUserId: options.actorUserId,
      payload: options.payload,
    },
  })
}

