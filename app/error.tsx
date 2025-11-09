'use client'

import { useEffect } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <div className="text-center space-y-4">
          <div className="text-6xl">😕</div>
          <h1 className="text-2xl font-bold text-accent">Une erreur est survenue</h1>
          <p className="text-gray-400">
            {error.message || 'Quelque chose s\'est mal passé'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={reset}>
              🔄 Réessayer
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/'}
            >
              🏠 Retour à l'accueil
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

