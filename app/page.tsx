'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'
import { useToast } from '@/components/Toast'
import { ChristmasCountdown } from '@/components/ChristmasCountdown'

type LoginMode = 'code' | 'email'

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const codeFromUrl = searchParams.get('code')
  
  const [mode, setMode] = useState<LoginMode>(codeFromUrl ? 'code' : 'code')
  const [code, setCode] = useState(codeFromUrl || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      let response: Response
      
      if (mode === 'code') {
        response = await fetch('/api/auth/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
      } else {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
      }
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || mode === 'code' ? 'Code invalide' : 'Email ou mot de passe incorrect')
      }
      
      const data = await response.json()
      
      toast.addToast('Connexion réussie !', 'success')
      
      // Vérifier si le profil est complet
      if (data.needsProfile) {
        router.push('/profile')
      } else {
        router.push('/app')
      }
    } catch (err: any) {
      const errorMsg = err.message || (mode === 'code' ? 'Code invalide' : 'Email ou mot de passe incorrect')
      setError(errorMsg)
      toast.addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 relative z-10">
            <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
              🎅
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-gold to-accent bg-clip-text text-transparent">
              Secret Santa
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Organisez votre tirage au sort de Noël en famille ✨
            </p>
            <div className="mb-8">
              <ChristmasCountdown />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <Card title="Connexion">
              {/* Tabs pour basculer entre code et email */}
              <div className="flex gap-2 mb-6 border-b border-dark-border">
                <button
                  type="button"
                  onClick={() => {
                    setMode('code')
                    setError(null)
                  }}
                  className={`px-4 py-2 font-medium transition-colors ${
                    mode === 'code'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Code de participation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('email')
                    setError(null)
                  }}
                  className={`px-4 py-2 font-medium transition-colors ${
                    mode === 'email'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Email / Mot de passe
                </button>
              </div>
              
              <form onSubmit={handleJoin} className="space-y-4">
                {mode === 'code' ? (
                  <Input
                    label="Code de participation"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABC123XYZ"
                    required
                    autoFocus
                  />
                ) : (
                  <>
                    <Input
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      autoFocus
                    />
                    <Input
                      label="Mot de passe"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </>
                )}
                
                {error && (
                  <div className="p-3 bg-accent/20 border border-accent rounded text-accent text-sm">
                    {error}
                  </div>
                )}
                
                        <Button type="submit" disabled={loading} className="w-full">
                          {loading ? (
                            'Connexion...'
                          ) : mode === 'code' ? (
                            <>🎯 Rejoindre un groupe</>
                          ) : (
                            <>🔐 Se connecter</>
                          )}
                        </Button>
              </form>
              
              <div className="mt-4 text-center text-sm text-gray-400">
                {mode === 'code' ? (
                  <>
                    <p>Vous n'avez pas de code ?</p>
                    <p>Contactez l'organisateur de votre groupe.</p>
                  </>
                ) : (
                  <>
                    <p>Vous n'avez pas de compte ?</p>
                    <p>Utilisez votre code de participation pour créer un compte.</p>
                  </>
                )}
              </div>
            </Card>
            
            <Card title="Comment ça marche ?">
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">1. Rejoignez votre groupe</h3>
                  <p className="text-sm">Utilisez le code de participation fourni par l'organisateur.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">2. Remplissez votre liste de souhaits</h3>
                  <p className="text-sm">Indiquez vos envies pour aider votre Secret Santa à choisir le cadeau parfait.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">3. Attendez l'ouverture du tirage</h3>
                  <p className="text-sm">Le tirage s'ouvrira automatiquement à la date et l'heure prévues.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">4. Découvrez votre Gâté secret</h3>
                  <p className="text-sm">Une fois le tirage ouvert, cliquez pour découvrir à qui vous offrez un cadeau !</p>
                </div>
              </div>
            </Card>
          </div>
          
          <Card title="Informations importantes">
            <div className="space-y-2 text-gray-300">
              <p>
                <strong className="text-white">Fuseau horaire :</strong> Indian/Reunion (UTC+4)
              </p>
              <p>
                <strong className="text-white">Date d'ouverture :</strong> 11 novembre 2025 à 11:00
              </p>
              <p className="text-sm text-gray-400 mt-4">
                Le tirage respecte les contraintes : personne ne peut se tirer elle-même, 
                et les membres d'un couple ne peuvent pas se tirer entre eux.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

