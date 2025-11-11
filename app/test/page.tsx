'use client'

import { useState } from 'react'
import { Card } from '@/components/Card'
import { SleepingSanta } from '@/components/SleepingSanta'
import { ScratchCard } from '@/components/ScratchCard'
import { TargetCard } from '@/components/TargetCard'

/**
 * Page de test - Accessible uniquement en développement
 * URL: http://localhost:3000/test
 */
export default function TestPage() {
  // Vérifier que nous sommes en développement
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Card>
          <h1 className="text-2xl font-bold text-white mb-4">Page non disponible</h1>
          <p className="text-white/80">Cette page n'est accessible qu'en mode développement.</p>
        </Card>
      </div>
    )
  }

  const [testValue, setTestValue] = useState('')
  const [testName, setTestName] = useState('Jean Dupont')
  const [isRevealed, setIsRevealed] = useState(false)
  const [testWishlist, setTestWishlist] = useState<any>(null)

  const handleReveal = () => {
    setIsRevealed(true)
    // Simuler une wishlist de test
    setTestWishlist({
      freeText: 'J\'aimerais des cadeaux qui me feront plaisir !',
      items: [
        {
          title: 'Livre sur le développement web',
          link: 'https://example.com',
          note: 'Version récente si possible',
          priority: 3,
          category: 'Livres',
          estimatedPrice: 25.99,
        },
        {
          title: 'Casque audio',
          note: 'Bluetooth de préférence',
          priority: 5,
          category: 'Électronique',
          estimatedPrice: 79.99,
        },
      ],
      updatedAt: new Date().toISOString(),
    })
  }

  const resetReveal = () => {
    setIsRevealed(false)
    setTestWishlist(null)
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <h1 className="text-3xl font-bold text-white mb-6">🧪 Page de Test</h1>
            <p className="text-white/80 mb-8">
              Cette page est uniquement accessible en développement local.
              Utilisez-la pour tester vos fonctionnalités.
            </p>

            <div className="space-y-6">
              {/* Test de révélation */}
              <div className="pt-4 border-t border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">🎁 Test de révélation du Gâté secret</h2>
                
                <div className="mb-4 space-y-3">
                  <label className="block text-white mb-2">
                    Nom/Prénom à révéler :
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testName}
                      onChange={(e) => {
                        setTestName(e.target.value)
                        resetReveal()
                      }}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Entrez un nom..."
                    />
                    <button
                      onClick={resetReveal}
                      className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>

                {!isRevealed ? (
                  <div className="space-y-4">
                    <p className="text-white/80 text-sm mb-4">
                      Faites glisser votre doigt ou votre souris sur la carte pour révéler le nom.
                    </p>
                    <ScratchCard 
                      targetName={testName}
                      onReveal={handleReveal}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg">
                      <p className="text-green-400 font-semibold">✅ Révélation effectuée !</p>
                    </div>
                    <TargetCard 
                      target={{
                        name: testName,
                        wishlist: testWishlist,
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">🎅 Animation Père Noël qui dort</h2>
                <SleepingSanta />
              </div>

              <div className="pt-4 border-t border-white/20">
                <label className="block text-white mb-2">Zone de test</label>
                <input
                  type="text"
                  value={testValue}
                  onChange={(e) => setTestValue(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tapez quelque chose..."
                />
                {testValue && (
                  <p className="mt-2 text-white/60">Valeur: {testValue}</p>
                )}
              </div>

              <div className="pt-4 border-t border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Informations de l'environnement</h2>
                <div className="space-y-2 text-white/80 text-sm">
                  <p><strong>Mode:</strong> {process.env.NODE_ENV || 'development'}</p>
                  <p><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_BASE_URL || 'Non définie'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

