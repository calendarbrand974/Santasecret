import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { HeaderGroup } from '@/components/HeaderGroup'
import { WishlistEditor } from '@/components/WishlistEditor'

async function getGroupData(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      timeZone: true,
      openAt: true,
    },
  })
  
  if (!group) {
    throw new Error('Groupe non trouvé')
  }
  
  return group
}

async function getMemberData(groupId: string, userId: string) {
  const member = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId,
      status: 'JOINED',
    },
    select: {
      id: true,
      wishlist: {
        select: {
          freeText: true,
          items: true,
          updatedAt: true,
        },
      },
    },
  })
  
  return member
}

export default async function WishlistPage() {
  const session = await getSession()
  
  if (!session || !session.groupId) {
    redirect('/')
  }
  
  const group = await getGroupData(session.groupId)
  const member = await getMemberData(session.groupId, session.userId)
  
  if (!member) {
    redirect('/')
  }
  
  const wishlist = member.wishlist || {
    freeText: '',
    items: [],
  }
  
  const items = (wishlist.items as any[]) || []
  
  return (
    <div className="min-h-screen bg-dark-bg">
      <HeaderGroup group={group} isAdmin={session.role === 'ADMIN'} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Ma Wishlist</h1>
            <p className="text-gray-400">
              Remplissez votre liste de souhaits pour aider votre Secret Santa à choisir le cadeau parfait
            </p>
          </div>
          
          <WishlistEditor
            initialFreeText={wishlist.freeText || ''}
            initialItems={items}
            groupId={group.id}
          />
        </div>
      </div>
    </div>
  )
}

