import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { HeaderGroup } from '@/components/HeaderGroup'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

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

export default async function AppPage() {
  const session = await getSession()
  
  if (!session || !session.groupId) {
    redirect('/')
  }
  
  const group = await getGroupData(session.groupId)
  
  return (
    <div className="min-h-screen bg-dark-bg">
      <HeaderGroup group={group} isAdmin={session.role === 'ADMIN'} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Bienvenue !</h1>
            <p className="text-xl text-gray-400">
              Gérez votre wishlist et découvrez votre Gâté secret
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="text-center hover:bg-dark-border transition-colors">
              <div className="text-5xl mb-4">📝</div>
              <h2 className="text-xl font-bold mb-2 text-primary">Ma Wishlist</h2>
              <p className="text-gray-400 mb-4">
                Remplissez votre liste de souhaits
              </p>
              <Link href="/app/wishlist">
                <Button className="w-full">
                  📝 Accéder à ma Wishlist
                </Button>
              </Link>
            </Card>
            
            <Card className="text-center hover:bg-dark-border transition-colors">
              <div className="text-5xl mb-4">🎁</div>
              <h2 className="text-xl font-bold mb-2 text-primary">Mon Gâté secret</h2>
              <p className="text-gray-400 mb-4">
                Découvrez votre Gâté secret
              </p>
              <Link href="/app/draw">
                <Button className="w-full">
                  🎁 Voir mon Gâté secret
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

