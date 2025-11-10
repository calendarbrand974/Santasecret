import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
    <div className="min-h-screen bg-dark-bg relative">
      <HeaderGroup group={group} isAdmin={session.role === 'ADMIN'} />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 relative z-10">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Secret Santa Logo"
                width={100}
                height={100}
                priority
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}>Bienvenue !</h1>
            <p className="text-xl text-white/90">
              Gérez votre wishlist et découvrez votre Gâté secret
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <Link href="/app/wishlist" className="block">
              <Card className="text-center cursor-pointer hover:scale-105 transition-transform">
                <div className="text-5xl mb-4">📝</div>
                <h2 className="text-xl font-bold mb-2 text-white">Ma Wishlist</h2>
                <p className="text-white/90 mb-4">
                  Remplissez votre liste de souhaits
                </p>
                <div className="w-full pointer-events-none">
                  <Button className="w-full pointer-events-none">
                    📝 Accéder à ma Wishlist
                  </Button>
                </div>
              </Card>
            </Link>
            
            <Link href="/app/draw" className="block">
              <Card className="text-center cursor-pointer hover:scale-105 transition-transform">
                <div className="text-5xl mb-4">🎁</div>
                <h2 className="text-xl font-bold mb-2 text-white">Mon Gâté secret</h2>
                <p className="text-white/90 mb-4">
                  Découvrez votre Gâté secret
                </p>
                <div className="w-full pointer-events-none">
                  <Button className="w-full pointer-events-none">
                    🎁 Voir mon Gâté secret
                  </Button>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

