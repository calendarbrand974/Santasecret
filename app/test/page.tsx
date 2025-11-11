'use client'

import { useState } from 'react'
import { Card } from '@/components/Card'
import { SleepingSanta } from '@/components/SleepingSanta'

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

