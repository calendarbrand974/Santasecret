import { NextRequest, NextResponse } from 'next/server'
import { requireGroupMember } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { wishlistSchema, validate } from '@/lib/validation'
import { sanitizeObject, sanitizeUrl } from '@/lib/sanitize'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { groupMemberId } = await requireGroupMember(params.id)
    
    const wishlist = await prisma.wishlist.findUnique({
      where: { groupMemberId },
    })
    
    return NextResponse.json({
      freeText: wishlist?.freeText || '',
      items: wishlist?.items || [],
      updatedAt: wishlist?.updatedAt?.toISOString(),
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
    const { groupMemberId, userId } = await requireGroupMember(params.id)
    const body = await request.json()
    
    // Validation
    const validation = validate(wishlistSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    // Sanitization
    let { freeText, items } = validation.data
    if (freeText) {
      freeText = sanitizeObject(freeText) as string
    }
    if (items) {
      items = items.map((item: any) => ({
        ...item,
        title: sanitizeObject(item.title),
        link: sanitizeUrl(item.link),
        note: item.note ? sanitizeObject(item.note) : null,
        category: item.category ? sanitizeObject(item.category) : null,
        imageUrl: sanitizeUrl(item.imageUrl),
        priority: item.priority ? Math.max(1, Math.min(5, Number(item.priority))) : null,
        estimatedPrice: item.estimatedPrice ? Math.max(0, Number(item.estimatedPrice)) : null,
        order: item.order ? Number(item.order) : null,
      }))
    }
    
    // Mettre à jour ou créer la wishlist
    const wishlist = await prisma.wishlist.upsert({
      where: { groupMemberId },
      create: {
        groupMemberId,
        freeText: freeText || null,
        items: items || [],
      },
      update: {
        freeText: freeText || null,
        items: items || [],
        updatedAt: new Date(),
      },
    })
    
    // Notifier le Santa assigné si le tirage est ouvert (en arrière-plan, ne pas bloquer la réponse)
    // On ne fait pas await pour ne pas ralentir la réponse
    Promise.all([
      prisma.group.findUnique({
        where: { id: params.id },
        select: {
          openAt: true,
          timeZone: true,
        },
      }),
      prisma.assignment.findFirst({
        where: {
          groupId: params.id,
          receiverId: groupMemberId,
          revealedAt: { not: null },
        },
        select: {
          giverId: true,
          giver: {
            select: {
              userId: true,
              user: {
                select: {
                  displayName: true,
                  email: true,
                },
              },
            },
          },
          receiver: {
            select: {
              user: {
                select: {
                  displayName: true,
                },
              },
            },
          },
        },
      }),
    ]).then(async ([group, assignment]) => {
      if (!group || !assignment) return
      
      const { isDrawOpen } = await import('@/lib/tz')
      if (isDrawOpen(new Date(group.openAt), group.timeZone)) {
        // Envoyer notifications en arrière-plan
        const { sendPushNotification } = await import('@/lib/push')
        const { sendEmail } = await import('@/lib/email')
        
        Promise.all([
          sendPushNotification(
            assignment.giverId,
            'Liste de souhaits mise à jour',
            `La liste de ${assignment.receiver.user?.displayName || 'votre Gâté secret'} a été mise à jour`,
            { type: 'wishlist_updated', groupId: params.id }
          ),
          assignment.giver.user?.email ? sendEmail({
            to: assignment.giver.user.email,
            template: 'wishlist_updated',
            data: {
              displayName: assignment.giver.user.displayName,
              targetName: assignment.receiver.user?.displayName || 'votre Gâté secret',
            },
            userId: assignment.giver.userId || undefined,
          }) : Promise.resolve(false),
        ]).catch(err => {
          console.error('Error sending notifications:', err)
        })
      }
    }).catch(err => {
      console.error('Error checking notifications:', err)
    })
    
    return NextResponse.json({
      success: true,
      wishlist: {
        freeText: wishlist.freeText,
        items: wishlist.items,
        updatedAt: wishlist.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

