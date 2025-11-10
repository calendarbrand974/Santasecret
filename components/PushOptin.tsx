'use client'

import { useState, useEffect } from 'react'
import { Card } from './Card'
import { Button } from './Button'

interface PushOptinProps {
  groupMemberId: string
}

export function PushOptin({ groupMemberId }: PushOptinProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])
  
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }
  
  const subscribe = async () => {
    if (!isSupported) return
    
    setLoading(true)
    try {
      // Demander la permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Les notifications ont été refusées')
        return
      }
      
      // Obtenir la clé publique VAPID
      const response = await fetch('/api/push/vapid-key')
      const { publicKey } = await response.json()
      
      // Convertir la clé
      const key = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0))
      
      // S'abonner
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      })
      
      // Envoyer au serveur
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
              auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
            },
          },
        }),
      })
      
      setIsSubscribed(true)
    } catch (error) {
      console.error('Error subscribing:', error)
      alert('Erreur lors de l\'abonnement aux notifications')
    } finally {
      setLoading(false)
    }
  }
  
  const unsubscribe = async () => {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (!isSupported) {
    return null
  }
  
  return (
    <Card title="Notifications">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Recevez des notifications push pour être informé de l'ouverture du tirage 
          et des mises à jour des listes de souhaits.
        </p>
        
        {isSubscribed ? (
          <div>
            <p className="text-sm text-white mb-2">✓ Notifications activées</p>
            <Button variant="secondary" onClick={unsubscribe} disabled={loading} className="w-full">
              {loading ? '⏳ Désabonnement...' : <>🔕 Désactiver les notifications</>}
            </Button>
          </div>
        ) : (
          <Button onClick={subscribe} disabled={loading} className="w-full">
            {loading ? '⏳ Activation...' : <>🔔 Activer les notifications</>}
          </Button>
        )}
      </div>
    </Card>
  )
}

