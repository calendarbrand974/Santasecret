import webpush from 'web-push'
import { prisma } from './prisma'

// Initialiser web-push avec les clés VAPID
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubjectRaw = process.env.VAPID_SUBJECT || 'mailto:admin@example.com'
// S'assurer que VAPID_SUBJECT commence par mailto:
const vapidSubject = vapidSubjectRaw.startsWith('mailto:') 
  ? vapidSubjectRaw 
  : `mailto:${vapidSubjectRaw}`

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Enregistre une souscription push pour un membre
 */
export async function subscribePush(
  groupMemberId: string,
  subscription: PushSubscriptionData,
  userAgent?: string
): Promise<void> {
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      groupMemberId,
      endpoint: subscription.endpoint,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth,
      ua: userAgent,
      is_active: true,
      lastSeenAt: new Date(),
    },
    update: {
      groupMemberId,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth,
      ua: userAgent,
      is_active: true,
      lastSeenAt: new Date(),
    },
  })
}

/**
 * Désabonne un endpoint push
 */
export async function unsubscribePush(endpoint: string): Promise<void> {
  await prisma.pushSubscription.updateMany({
    where: { endpoint },
    data: { is_active: false },
  })
}

/**
 * Envoie une notification push à un membre
 */
export async function sendPushNotification(
  groupMemberId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<number> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      groupMemberId,
      is_active: true,
    },
  })
  
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured, skipping push notifications')
    return 0
  }
  
  let sentCount = 0
  
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth,
          },
        },
        JSON.stringify({
          title,
          body,
          data: data || {},
          icon: '/icon-192x192.png',
        })
      )
      sentCount++
      
      // Mettre à jour lastSeenAt
      await prisma.pushSubscription.update({
        where: { id: sub.id },
        data: { lastSeenAt: new Date() },
      })
    } catch (error: any) {
      console.error('Push notification error:', error)
      
      // Si l'endpoint est invalide, désactiver la souscription
      if (error.statusCode === 410 || error.statusCode === 404) {
        await prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { is_active: false },
        })
      }
    }
  }
  
  return sentCount
}

/**
 * Envoie une notification push à tous les membres d'un groupe
 */
export async function sendPushToGroup(
  groupId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<number> {
  const members = await prisma.groupMember.findMany({
    where: { groupId, status: 'JOINED' },
    select: { id: true },
  })
  
  let totalSent = 0
  for (const member of members) {
    totalSent += await sendPushNotification(member.id, title, body, data)
  }
  
  return totalSent
}

/**
 * Obtient la clé publique VAPID pour le client
 */
export function getVapidPublicKey(): string | null {
  return vapidPublicKey || null
}

