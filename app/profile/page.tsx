import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/ProfileForm'
import { HeaderGroup } from '@/components/HeaderGroup'
import { PushOptin } from '@/components/PushOptin'

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      email: true,
      passwordSetAt: true,
      groupMembers: {
        where: { status: 'JOINED' },
        select: {
          id: true,
          role: true,
          group: {
            select: {
              id: true,
              name: true,
              timeZone: true,
              openAt: true,
            },
          },
        },
        take: 1,
      },
    },
  })
  
  return user
}

export default async function ProfilePage() {
  const session = await getSession()
  
  if (!session || !session.userId) {
    redirect('/')
  }
  
  const user = await getUserData(session.userId)
  
  if (!user) {
    redirect('/')
  }
  
  const group = user.groupMembers[0]?.group
  const groupMember = user.groupMembers[0]
  
  return (
    <div className="min-h-screen bg-dark-bg">
      {group && <HeaderGroup group={group} isAdmin={session.role === 'ADMIN'} />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">Mon profil</h1>
            <p className="text-gray-400">
              Complétez votre profil pour personnaliser votre expérience
            </p>
          </div>
          
          <div className="space-y-6">
            <ProfileForm 
              user={user}
              groupId={group?.id}
            />
            
            {groupMember && (
              <PushOptin groupMemberId={groupMember.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

