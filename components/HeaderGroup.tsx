import Link from 'next/link'
import { Button } from './Button'

interface Group {
  id: string
  name: string
  timeZone: string
  openAt: Date
}

interface HeaderGroupProps {
  group: Group
  isAdmin?: boolean
}

export function HeaderGroup({ group, isAdmin }: HeaderGroupProps) {
  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 relative z-20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end items-center flex-wrap gap-4">
          <nav className="flex gap-2 items-center flex-wrap">
            <Link href="/profile">
              <Button variant="secondary" className="h-10 px-4 min-w-[80px]">👤 Profil</Button>
            </Link>
            <Link href="/app/wishlist">
              <Button variant="secondary" className="h-10 px-4 min-w-[120px]">📝 Ma Wishlist</Button>
            </Link>
            <Link href="/app/draw">
              <Button variant="secondary" className="h-10 px-4 min-w-[160px] whitespace-nowrap">🎁 Mon Gâté secret</Button>
            </Link>
            {isAdmin && (
              <Link href={`/admin/${group.id}`}>
                <Button variant="secondary" className="h-10 px-4 min-w-[80px]">⚙️ Admin</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

