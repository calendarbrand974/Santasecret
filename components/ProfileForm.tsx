'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './Button'
import { Input } from './Input'
import { Card } from './Card'
import { useToast } from './Toast'

interface User {
  id: string
  displayName: string
  email: string | null
  passwordSetAt: Date | null
}

interface ProfileFormProps {
  user: User
  groupId?: string
}

export function ProfileForm({ user, groupId }: ProfileFormProps) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [email, setEmail] = useState(user.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  
  const hasPassword = !!user.passwordSetAt
  const needsProfile = !user.email || 
                       !user.displayName || 
                       user.displayName.startsWith('Membre') ||
                       user.displayName.length < 3
  
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false)
        if (groupId) {
          router.push('/app')
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [success, router, groupId])
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          email: email || null,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }
      
      toast.addToast('Profil mis à jour avec succès !', 'success')
      router.refresh()
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la mise à jour'
      setError(errorMsg)
      toast.addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setSaving(false)
      return
    }
    
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setSaving(false)
      return
    }
    
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la définition du mot de passe')
      }
      
      setPassword('')
      setConfirmPassword('')
      setCurrentPassword('')
      toast.addToast('Mot de passe défini avec succès !', 'success')
      router.refresh()
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la définition du mot de passe'
      setError(errorMsg)
      toast.addToast(errorMsg, 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setSaving(false)
      return
    }
    
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setSaving(false)
      return
    }
    
    try {
      // TODO: Implémenter la vérification du mot de passe actuel
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword,
          newPassword: password 
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors du changement de mot de passe')
      }
      
      setPassword('')
      setConfirmPassword('')
      setCurrentPassword('')
      toast.addToast('Mot de passe changé avec succès !', 'success')
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors du changement de mot de passe'
      setError(errorMsg)
      toast.addToast(errorMsg, 'error')
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <div className="space-y-6">
      {needsProfile && (
        <Card className="border-primary/50 bg-primary/10">
          <div className="flex items-start gap-3">
            <div className="text-2xl">👋</div>
            <div>
              <h3 className="font-semibold text-primary mb-1">Bienvenue !</h3>
              <p className="text-sm text-gray-300">
                Complétez votre profil pour commencer. Vous pourrez modifier ces informations plus tard.
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Formulaire de profil */}
      <Card title="Informations personnelles">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Nom d'affichage"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Votre nom"
            required
          />
          
          <Input
            label="Email (optionnel)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
          />
          
          {error && (
            <div className="p-3 bg-accent/20 border border-accent rounded text-accent text-sm">
              {error}
            </div>
          )}
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </form>
      </Card>
      
      {/* Définir ou changer le mot de passe */}
      <Card title={hasPassword ? 'Changer le mot de passe' : 'Définir un mot de passe'}>
        <form onSubmit={hasPassword ? handleChangePassword : handleSetPassword} className="space-y-4">
          {hasPassword && (
            <Input
              label="Mot de passe actuel"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Entrez votre mot de passe actuel"
              required
            />
          )}
          
          <Input
            label={hasPassword ? 'Nouveau mot de passe' : 'Mot de passe'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Au moins 8 caractères"
            required
            minLength={8}
          />
          
          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Répétez le mot de passe"
            required
            minLength={8}
          />
          
          <Button type="submit" disabled={saving} variant="secondary" className="w-full">
            {saving ? 'Enregistrement...' : hasPassword ? 'Changer le mot de passe' : 'Définir le mot de passe'}
          </Button>
        </form>
      </Card>
      
      {groupId && (
        <div className="text-center">
          <Button 
            variant="primary" 
            onClick={() => router.push('/app')}
            className="w-full"
          >
            Continuer vers l'application
          </Button>
        </div>
      )}
    </div>
  )
}

