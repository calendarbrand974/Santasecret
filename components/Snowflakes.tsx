'use client'

import { useEffect, useState } from 'react'

interface Snowflake {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  type: 'snowflake' | 'dot'
  symbol: string
}

const snowflakeSymbols = ['❄', '❅', '❆', '✻', '✼', '✽']

export function Snowflakes() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

  useEffect(() => {
    // Créer 100 flocons de neige variés
    const flakes: Snowflake[] = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.5,
      type: Math.random() > 0.3 ? 'snowflake' : 'dot',
      symbol: Math.random() > 0.3 
        ? snowflakeSymbols[Math.floor(Math.random() * snowflakeSymbols.length)]
        : '•',
    }))

    setSnowflakes(flakes)

    // Animation des flocons
    const interval = setInterval(() => {
      setSnowflakes((prev) =>
        prev.map((flake) => ({
          ...flake,
          y: flake.y >= 100 ? -5 : flake.y + flake.speed * 0.1,
          x: flake.x + Math.sin(flake.y * 0.1) * 0.5,
        }))
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white"
          style={{
            left: `${flake.x}%`,
            top: `${flake.y}%`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            transform: `rotate(${flake.y * 2}deg)`,
            transition: 'all 0.1s linear',
            filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 1))',
            textShadow: '0 0 6px rgba(255, 255, 255, 0.9), 0 0 3px rgba(255, 255, 255, 0.7)',
            zIndex: 1,
          }}
        >
          {flake.symbol}
        </div>
      ))}
    </div>
  )
}

