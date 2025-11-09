'use client'

import { useEffect, useState } from 'react'

export function ChristmasRevealAnimation() {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    speed: number
    opacity: number
    type: 'snow' | 'star' | 'sparkle'
  }>>([])

  useEffect(() => {
    // Créer des particules variées
    const newParticles: Array<{
      id: number
      x: number
      y: number
      size: number
      speed: number
      opacity: number
      type: 'snow' | 'star' | 'sparkle'
    }> = []

    // Flocons de neige
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 2,
        speed: Math.random() * 0.5 + 0.3,
        opacity: Math.random() * 0.5 + 0.3,
        type: 'snow',
      })
    }

    // Étoiles scintillantes
    for (let i = 15; i < 25; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
        type: 'star',
      })
    }

    // Étincelles dorées
    for (let i = 25; i < 35; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 0.4 + 0.2,
        opacity: Math.random() * 0.9 + 0.5,
        type: 'sparkle',
      })
    }

    setParticles(newParticles)

    // Animation des particules
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => {
          let newY = particle.y + particle.speed
          let newX = particle.x

          if (particle.type === 'snow') {
            newX = particle.x + Math.sin(particle.y * 0.1) * 0.3
          } else if (particle.type === 'sparkle') {
            newX = particle.x + (Math.random() - 0.5) * 0.5
          }

          if (newY > 100) {
            newY = -5
            newX = Math.random() * 100
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            opacity: particle.type === 'star' 
              ? 0.3 + Math.sin(Date.now() * 0.005 + particle.id) * 0.5
              : particle.opacity,
          }
        })
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-64 mb-6 overflow-hidden rounded-lg">
      {/* Particules animées */}
      {particles.map((particle) => {
        if (particle.type === 'snow') {
          return (
            <div
              key={particle.id}
              className="absolute text-white pointer-events-none"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                fontSize: `${particle.size}px`,
                opacity: particle.opacity,
                transform: `rotate(${particle.y * 2}deg)`,
                transition: 'all 0.1s linear',
              }}
            >
              ❄
            </div>
          )
        } else if (particle.type === 'star') {
          return (
            <div
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                fontSize: `${particle.size}px`,
                opacity: particle.opacity,
                color: '#ffd700',
                filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))',
                transform: `rotate(${particle.y * 3}deg) scale(${0.8 + Math.sin(Date.now() * 0.003 + particle.id) * 0.2})`,
                transition: 'all 0.1s linear',
              }}
            >
              ⭐
            </div>
          )
        } else {
          return (
            <div
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                fontSize: `${particle.size}px`,
                opacity: particle.opacity,
                color: '#ffd700',
                filter: 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.6))',
                transform: `rotate(${particle.y * 4}deg)`,
                transition: 'all 0.1s linear',
              }}
            >
              ✨
            </div>
          )
        }
      })}

      {/* Cadeau central animé */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="text-6xl animate-bounce"
          style={{ 
            animationDuration: '2s',
            filter: 'drop-shadow(0 0 10px rgba(13, 125, 77, 0.5))',
          }}
        >
          🎁
        </div>
      </div>

      {/* Effet de lumière pulsante */}
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'radial-gradient(circle at center, rgba(13, 125, 77, 0.1) 0%, transparent 70%)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />
    </div>
  )
}

