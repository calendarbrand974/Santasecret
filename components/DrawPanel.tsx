'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './Button'
import { Card } from './Card'
import { Countdown } from './Countdown'
import { TargetCard } from './TargetCard'
import { ScratchCard } from './ScratchCard'
import { useToast } from './Toast'
import { WishlistDisplay } from './WishlistDisplay'
import { ChristmasRevealAnimation } from './ChristmasRevealAnimation'
import { SleepingSanta } from './SleepingSanta'

interface DrawPanelProps {
  groupId: string
  openAt: Date
  timeZone: string
  isOpen: boolean
  hasAssignment?: boolean
}

export function DrawPanel({ groupId, openAt, timeZone, isOpen, hasAssignment = true }: DrawPanelProps) {
  const router = useRouter()
  const toast = useToast()
  const [revealing, setRevealing] = useState(false)
  const [target, setTarget] = useState<any>(null)
  const [targetName, setTargetName] = useState<string | null>(null) // Nom pour le scratch card
  const [targetWishlist, setTargetWishlist] = useState<any>(null) // Wishlist du Gâté secret
  const [error, setError] = useState<string | null>(null)
  const [isScratching, setIsScratching] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  
  // Récupérer le nom et la wishlist du Gâté secret (sans révéler dans la DB)
  const loadTargetName = async () => {
    if (targetName) return // Déjà chargé
    
    try {
      const response = await fetch(`/api/groups/${groupId}/assignment/target-name`)
      if (response.ok) {
        const data = await response.json()
        setTargetName(data.name)
        if (data.wishlist) {
          setTargetWishlist(data.wishlist)
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement du nom:', err)
    }
  }
  
  const handleReveal = async () => {
    // Enregistrer la révélation dans la DB (sans rafraîchir la page)
    setRevealing(true)
    setError(null)
    try {
      const response = await fetch(`/api/groups/${groupId}/assignment/reveal`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la révélation')
      }
      
      const data = await response.json()
      setTarget(data)
      // Charger la wishlist si pas déjà chargée
      if (data.wishlist && !targetWishlist) {
        setTargetWishlist(data.wishlist)
      }
      toast.addToast('Votre Gâté secret a été révélé ! 🎁', 'success')
      // Ne PAS rafraîchir la page, laisser l'utilisateur continuer à gratter
      // Le rafraîchissement se fera uniquement quand on clique sur le bouton
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la révélation'
      setError(errorMsg)
      toast.addToast(errorMsg, 'error')
    } finally {
      setRevealing(false)
    }
  }
  
  const handleViewWishlist = () => {
    setShowWishlist(true)
    // Rafraîchir la page pour afficher la wishlist complète
    router.refresh()
  }
  
  const handleScratchStart = async () => {
    if (!targetName) {
      setIsScratching(true)
      await loadTargetName()
      setIsScratching(false)
    }
  }
  
  const handleScratchComplete = async () => {
    // Quand l'utilisateur a gratté plus de 50%, révéler dans la DB
    await handleReveal()
  }
  
  if (!isOpen) {
    return (
      <Card>
        <div className="mb-6">
          <SleepingSanta />
        </div>
        <Countdown targetDate={openAt} timeZone={timeZone} />
        <div className="mt-6 text-center text-gray-400">
          Le tirage n'est pas encore ouvert. Revenez à l'heure indiquée !
        </div>
      </Card>
    )
  }
  
  // Ne plus afficher TargetCard directement, on garde le scratch card même après révélation
  // if (target) {
  //   return <TargetCard target={target} />
  // }
  
  if (!hasAssignment) {
    return (
      <Card>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-yellow-400">⏳ Tirage en attente</h2>
          <p className="text-gray-400">
            Le tirage au sort n'a pas encore été effectué. L'administrateur du groupe doit déclencher le tirage.
          </p>
          <p className="text-sm text-gray-500">
            Une fois le tirage effectué, vous pourrez découvrir votre Gâté secret ici.
          </p>
        </div>
      </Card>
    )
  }

  // Si on a le nom du Gâté secret, afficher le scratch card
  if (targetName) {
    // Vérifier si la révélation a été faite (target existe)
    const isRevealed = target !== null
    
    return (
      <>
        <Card>
          <div className="text-center space-y-4 mb-6">
            <h2 className="text-2xl font-bold">🎄 Grattez votre ticket de Noël ! 🎄</h2>
            <p className="text-gray-400">
              Faites glisser votre doigt ou votre souris pour révéler votre Gâté secret
            </p>
          </div>
          {error && (
            <div className="p-3 bg-accent/20 border border-accent rounded text-accent mb-4">
              {error}
            </div>
          )}
          <ScratchCard 
            targetName={targetName}
            onReveal={handleScratchComplete}
          />
        </Card>
        
        {/* Bouton pour voir la wishlist une fois révélé (en dehors du ticket) */}
        {isRevealed && (
          <div className="mt-6 text-center">
            <button
              onClick={handleViewWishlist}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-dark-bg font-bold rounded-lg shadow-lg transition-colors"
            >
              🎁 Voir la wishlist de mon Gâté secret
            </button>
          </div>
        )}
        
        {/* Afficher la wishlist si demandée */}
        {showWishlist && targetWishlist && (
          <Card className="mt-6">
            <WishlistDisplay wishlist={targetWishlist} />
          </Card>
        )}
      </>
    )
  }

  return (
    <Card>
      <div className="text-center space-y-4">
        {/* Animation festive avant la révélation */}
        <ChristmasRevealAnimation />
        
        <h2 className="text-2xl font-bold">C'est l'heure du tirage !</h2>
        <p className="text-gray-400">
          Cliquez sur le bouton ci-dessous pour découvrir votre Gâté secret.
        </p>
        {error && (
          <div className="p-3 bg-accent/20 border border-accent rounded text-accent">
            {error}
          </div>
        )}
        <Button
          onClick={handleScratchStart}
          disabled={revealing || isScratching}
          className="w-full"
        >
          {isScratching ? (
            '⏳ Chargement...'
          ) : revealing ? (
            '✨ Révélation...'
          ) : (
            <>🎁 Découvrir mon Gâté secret</>
          )}
        </Button>
      </div>
    </Card>
  )
}

