'use client'

import { useRef, useEffect, useState } from 'react'

interface ScratchCardProps {
  targetName: string
  onReveal?: () => void
}

export function ScratchCard({ targetName, onReveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [scratchProgress, setScratchProgress] = useState(0)
  const isScratchingRef = useRef(false)
  const hasRevealedRef = useRef(false)
  const lastProgressCheckRef = useRef(0)
  const animationFrameRef = useRef<number>()
  
  // Réinitialiser les états quand targetName change
  useEffect(() => {
    setIsRevealed(false)
    setScratchProgress(0)
    hasRevealedRef.current = false
    isScratchingRef.current = false
  }, [targetName])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) return

    // Attendre que le canvas soit rendu pour avoir les bonnes dimensions
    const initCanvas = () => {
      // Réinitialiser les dimensions
      const rect = canvas.getBoundingClientRect()
      const width = canvas.width = rect.width
      const height = canvas.height = rect.height

      // Réinitialiser le canvas (effacer tout)
      ctx.clearRect(0, 0, width, height)

      // Fonction pour dessiner le fond grattable (blanc nacré avec motifs verts)
      const drawBackground = () => {
        // Créer un dégradé blanc nacré avec teinte verte
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, '#ffffff') // Blanc
        gradient.addColorStop(0.3, '#f0fff4') // Blanc verdâtre clair
        gradient.addColorStop(0.5, '#e6f7ed') // Vert très clair
        gradient.addColorStop(0.7, '#f0fff4') // Blanc verdâtre clair
        gradient.addColorStop(1, '#ffffff') // Blanc
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
        
        // Ajouter un effet de brillance
        const shineGradient = ctx.createLinearGradient(0, 0, width, 0)
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
        shineGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)')
        shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)')
        shineGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)')
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = shineGradient
        ctx.fillRect(0, 0, width, height / 3)
        
        // Ajouter des motifs de Noël en vert
        ctx.fillStyle = '#0d7d4d' // Vert sapin
        ctx.font = 'bold 40px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🎄', width / 2, height / 2 - 30)
        ctx.fillText('🎁', width / 2, height / 2 + 30)
      }
      
      // Toujours redessiner le background pour s'assurer qu'il est visible
      drawBackground()
    }

    // Initialiser immédiatement
    initCanvas()

    // Réinitialiser aussi après un court délai pour s'assurer que les dimensions sont correctes
    const timeoutId = setTimeout(initCanvas, 100)
    
    // Obtenir les dimensions actuelles du canvas
    const getCanvasDimensions = () => {
      const rect = canvas.getBoundingClientRect()
      return { width: rect.width, height: rect.height }
    }

    // Fonction optimisée pour calculer le pourcentage (échantillonnage)
    const calculateProgress = () => {
      const { width, height } = getCanvasDimensions()
      // Échantillonner seulement une partie des pixels pour la performance
      const sampleRate = 10 // Vérifier 1 pixel sur 10
      const imageData = ctx.getImageData(0, 0, width, height)
      const pixels = imageData.data
      let transparentPixels = 0
      let totalSampled = 0
      
      for (let i = 3; i < pixels.length; i += 4 * sampleRate) {
        totalSampled++
        if (pixels[i] < 128) { // Alpha < 128 (semi-transparent ou transparent)
          transparentPixels++
        }
      }
      
      return totalSampled > 0 ? (transparentPixels / totalSampled) * 100 : 0
    }
    
    // Fonction pour gratter avec optimisation
    const scratch = (x: number, y: number) => {
      if (!ctx) return
      
      // Créer un effet de grattage circulaire plus fluide
      const radius = 35
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
      
      // Vérifier le progrès seulement toutes les 100ms pour la performance
      const now = Date.now()
      if (now - lastProgressCheckRef.current > 100) {
        lastProgressCheckRef.current = now
        
        // Utiliser requestAnimationFrame pour éviter de bloquer
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          const progress = calculateProgress()
          setScratchProgress(progress)
          
          // Si plus de 20% est gratté, considérer comme révélé (mais ne pas tout révéler)
          if (progress > 20 && !hasRevealedRef.current) {
            hasRevealedRef.current = true
            setIsRevealed(true)
            if (onReveal) {
              onReveal()
            }
            // Ne pas révéler tout d'un coup, laisser l'utilisateur continuer à gratter
          }
        })
      }
    }

    // Gestionnaires d'événements pour le grattage
    const handleMouseDown = (e: MouseEvent) => {
      isScratchingRef.current = true
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      scratch(x, y)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isScratchingRef.current) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      scratch(x, y)
    }

    const handleMouseUp = () => {
      isScratchingRef.current = false
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      isScratchingRef.current = true
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      scratch(x, y)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (!isScratchingRef.current) return
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      scratch(x, y)
    }

    const handleTouchEnd = () => {
      isScratchingRef.current = false
    }

    // Ajouter les event listeners
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    canvas.addEventListener('touchstart', handleTouchStart)
    canvas.addEventListener('touchmove', handleTouchMove)
    canvas.addEventListener('touchend', handleTouchEnd)

    return () => {
      clearTimeout(timeoutId)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [targetName, onReveal]) // Réinitialiser quand targetName change

  return (
    <div className="relative w-full">
      <div className="relative bg-gradient-to-br from-accent to-red-800 rounded-lg p-8 shadow-2xl border-4 border-primary min-h-[300px] overflow-hidden">
        {/* Contenu révélé (caché en dessous, visible progressivement) */}
        <div className="text-center relative z-0">
          <div className="text-6xl mb-4">🎁</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Votre Gâté secret est :
          </h2>
          <div className="text-4xl font-bold text-white mb-4 drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.8)' }}>
            {targetName}
          </div>
          <div className="text-white text-lg">
            🎄 Joyeux Noël ! 🎄
          </div>
        </div>

        {/* Canvas de grattage (masque qui révèle progressivement) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full rounded-lg cursor-grab active:cursor-grabbing touch-none z-10 opacity-100"
          style={{ userSelect: 'none', minHeight: '300px' }}
        />

        {/* Instructions */}
        {!isRevealed && (
          <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm opacity-75 pointer-events-none z-20">
            👆 Grattez pour révéler votre Gâté secret
            {scratchProgress > 0 && (
              <span className="block mt-1">
                {Math.round(scratchProgress)}% révélé
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

