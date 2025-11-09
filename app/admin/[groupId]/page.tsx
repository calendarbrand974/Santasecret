import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { requireAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { AdminTabs } from '@/components/AdminTabs'
import { HeaderGroup } from '@/components/HeaderGroup'

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
  
  return group
}

export default async function AdminPage({
  params,
}: {
  params: { groupId: string }
}) {
  const session = await getSession()
  
  if (!session || !session.groupId) {
    redirect('/')
  }
  
  try {
    await requireAdmin(params.groupId)
  } catch {
    redirect('/app')
  }
  
  const group = await getGroupData(params.groupId)
  
  if (!group) {
    redirect('/app')
  }
  
  return (
    <div className="min-h-screen bg-dark-bg">
      <HeaderGroup group={group} isAdmin={true} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-primary">
            Administration
          </h1>
          <AdminTabs groupId={params.groupId} />
        </div>
      </div>
    </div>
  )
}

