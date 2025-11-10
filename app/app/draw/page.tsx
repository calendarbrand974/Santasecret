import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { isDrawOpen } from '@/lib/tz'
import { HeaderGroup } from '@/components/HeaderGroup'
import { DrawPanel } from '@/components/DrawPanel'
import { TargetCard } from '@/components/TargetCard'

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
      assignmentsAsGiver: {
        where: {
          revealedAt: { not: null },
        },
        select: {
          receiver: {
            select: {
              id: true,
              user: {
                select: {
                  displayName: true,
                },
              },
              wishlist: {
                select: {
                  freeText: true,
                  items: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
        take: 1,
      },
    },
  })
  
  return member
}

async function checkAssignmentExists(groupId: string, groupMemberId: string): Promise<boolean> {
  const assignment = await prisma.assignment.findFirst({
    where: {
      groupId,
      giverId: groupMemberId,
    },
  })
  
  return assignment !== null
}

export default async function DrawPage() {
  const session = await getSession()
  
  if (!session || !session.groupId) {
    redirect('/')
  }
  
  const group = await getGroupData(session.groupId)
  const member = await getMemberData(session.groupId, session.userId)
  
  if (!member) {
    redirect('/')
  }
  
  const isOpen = isDrawOpen(new Date(group.openAt), group.timeZone)
  const revealedAssignment = member.assignmentsAsGiver[0]
  const revealedTarget = revealedAssignment?.receiver
  
  // Vérifier si une assignation existe (même non révélée)
  const hasAssignment = await checkAssignmentExists(session.groupId, member.id)
  
  // Préparer les données du Gâté secret si déjà révélé
  const targetData = revealedTarget ? {
    name: revealedTarget.user?.displayName || 'Inconnu',
    wishlist: revealedTarget.wishlist ? {
      freeText: revealedTarget.wishlist.freeText ?? undefined,
      items: revealedTarget.wishlist.items as any,
      updatedAt: revealedTarget.wishlist.updatedAt.toISOString(),
    } : undefined,
  } : null
  
  return (
    <div className="min-h-screen bg-dark-bg">
      <HeaderGroup group={group} isAdmin={session.role === 'ADMIN'} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Mon Gâté secret</h1>
            <p className="text-gray-400">
              Découvrez à qui vous offrez un cadeau cette année
            </p>
          </div>
          
          {targetData ? (
            <TargetCard target={targetData} />
          ) : (
            <DrawPanel
              groupId={group.id}
              openAt={new Date(group.openAt)}
              timeZone={group.timeZone}
              isOpen={isOpen}
              hasAssignment={hasAssignment}
            />
          )}
        </div>
      </div>
    </div>
  )
}

