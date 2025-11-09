import Link from 'next/link'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <div className="space-y-4">
          <div className="text-6xl">🔍</div>
          <h1 className="text-3xl font-bold text-primary">404</h1>
          <p className="text-gray-400">
            La page que vous cherchez n'existe pas.
          </p>
          <Link href="/">
            <Button className="w-full">
              🏠 Retour à l'accueil
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

