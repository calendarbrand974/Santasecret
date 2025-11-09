'use client'

import { useEffect, useState } from 'react'

interface Snowflake {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
}

export function Snowflakes() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

  useEffect(() => {
    // Créer 50 flocons de neige
    const flakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    }))

    setSnowflakes(flakes)

    // Animation des flocons
    const interval = setInterval(() => {
      setSnowflakes((prev) =>
        prev.map((flake) => ({
          ...flake,
          y: flake.y >= 100 ? 0 : flake.y + flake.speed * 0.1,
          x: flake.x + Math.sin(flake.y * 0.1) * 0.5,
        }))
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
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
          }}
        >
          ❄
        </div>
      ))}
    </div>
  )
}

