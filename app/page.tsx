'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
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
      
      console.log('[LOGIN] Mode:', mode)
      
      if (mode === 'code') {
        console.log('[LOGIN] Tentative de connexion avec code:', code)
        response = await fetch('/api/auth/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
      } else {
        console.log('[LOGIN] Tentative de connexion avec email:', email)
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
      }
      
      console.log('[LOGIN] Réponse status:', response.status)
      
      if (!response.ok) {
        const data = await response.json()
        console.log('[LOGIN] Erreur API:', data)
        // Utiliser l'erreur de l'API si elle existe, sinon utiliser le message par défaut selon le mode
        const errorMessage = data.error || (mode === 'code' ? 'Code invalide' : 'Email ou mot de passe incorrect')
        console.log('[LOGIN] Message d\'erreur final:', errorMessage)
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      
      toast.addToast('Connexion réussie !', 'success')
      
      // Utiliser window.location pour éviter les erreurs de navigation
      // Attendre un court délai pour que le toast s'affiche
      setTimeout(() => {
        if (data.needsProfile) {
          window.location.href = '/profile'
        } else {
          window.location.href = '/app'
        }
      }, 100)
    } catch (err: any) {
      const errorMsg = err.message || (mode === 'code' ? 'Code invalide' : 'Email ou mot de passe incorrect')
      setError(errorMsg)
      toast.addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-dark-bg relative">
      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 relative z-10">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Secret Santa Logo"
                width={250}
                height={250}
                priority
              />
            </div>
            <div className="mb-8">
              <ChristmasCountdown />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <Card title="Connexion">
              {/* Tabs pour basculer entre code et email */}
              <div className="flex gap-2 mb-6 border-b-2 border-white/40 relative">
                <button
                  type="button"
                  onClick={() => {
                    setMode('code')
                    setError(null)
                  }}
                  className={`px-4 py-3 font-semibold transition-all rounded-t-lg relative ${
                    mode === 'code'
                      ? 'bg-white text-primary shadow-lg'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                  style={mode === 'code' ? {
                    borderBottom: '4px solid white',
                    marginBottom: '-2px',
                  } : {}}
                >
                  Code de participation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('email')
                    setError(null)
                  }}
                  className={`px-4 py-3 font-semibold transition-all rounded-t-lg relative ${
                    mode === 'email'
                      ? 'bg-white text-primary shadow-lg'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                  style={mode === 'email' ? {
                    borderBottom: '4px solid white',
                    marginBottom: '-2px',
                  } : {}}
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
              
              <div className="mt-4 text-center text-sm text-white/80">
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
              <div className="space-y-4 text-white/90">
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
            <div className="space-y-2 text-white/90">
              <p>
                <strong className="text-white">Fuseau horaire :</strong> Indian/Reunion (UTC+4)
              </p>
              <p>
                <strong className="text-white">Date d'ouverture :</strong> 11 novembre 2025 à 11:00
              </p>
              <p className="text-sm text-white/80 mt-4">
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

