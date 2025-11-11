import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { isDrawOpen } from '@/lib/tz'
import { HeaderGroup } from '@/components/HeaderGroup'
import { DrawPanel } from '@/components/DrawPanel'

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
  // Vérifier si une assignation existe (même non révélée)
  const hasAssignment = await checkAssignmentExists(session.groupId, member.id)
  
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
          <DrawPanel
            groupId={group.id}
            openAt={new Date(group.openAt)}
            timeZone={group.timeZone}
            isOpen={isOpen}
            hasAssignment={hasAssignment}
          />
        </div>
      </div>
    </div>
  )
}

