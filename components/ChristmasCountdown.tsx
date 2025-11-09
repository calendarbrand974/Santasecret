'use client'

import { useEffect, useState } from 'react'

export function ChristmasCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)
  
  useEffect(() => {
    const getNextChristmas = () => {
      const now = new Date()
      const currentYear = now.getFullYear()
      // Noël est le 25 décembre à minuit
      let christmas = new Date(currentYear, 11, 25, 0, 0, 0) // 11 = décembre (0-indexed)
      
      // Si Noël est déjà passé cette année, prendre l'année prochaine
      if (now > christmas) {
        christmas = new Date(currentYear + 1, 11, 25, 0, 0, 0)
      }
      
      return christmas
    }
    
    const updateCountdown = () => {
      const now = new Date()
      const christmas = getNextChristmas()
      const diff = christmas.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeLeft({ days, hours, minutes, seconds })
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  if (!timeLeft) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse text-gray-400">Chargement...</div>
      </div>
    )
  }
  
  const { days, hours, minutes, seconds } = timeLeft
  
  // Si c'est Noël aujourd'hui
  if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-3xl font-bold text-primary mb-2">🎄 Joyeux Noël ! 🎄</div>
        <div className="text-gray-300">C'est le grand jour !</div>
      </div>
    )
  }
  
  return (
    <div className="text-center py-4 relative z-10">
      <div className="text-xl font-semibold mb-4 text-white flex items-center justify-center gap-2">
        <span className="text-2xl">🎄</span>
        Noël dans :
        <span className="text-2xl">🎄</span>
      </div>
      <div className="flex gap-4 justify-center flex-wrap">
        <div className="flex flex-col items-center bg-dark-surface rounded-lg p-4 min-w-[80px] border border-primary/50 shadow-md hover:scale-105 transition-transform" style={{ boxShadow: '0 0 15px rgba(13, 125, 77, 0.3), 0 0 8px rgba(220, 38, 38, 0.2)' }}>
          <div className="text-4xl font-bold bg-gradient-to-br from-primary via-gold to-accent bg-clip-text text-transparent">{days}</div>
          <div className="text-sm text-gray-400 mt-1">jour{days > 1 ? 's' : ''}</div>
        </div>
        <div className="flex flex-col items-center bg-dark-surface rounded-lg p-4 min-w-[80px] border border-accent/50 shadow-md hover:scale-105 transition-transform" style={{ boxShadow: '0 0 15px rgba(220, 38, 38, 0.3), 0 0 8px rgba(13, 125, 77, 0.2)' }}>
          <div className="text-4xl font-bold bg-gradient-to-br from-accent via-gold to-primary bg-clip-text text-transparent">{hours}</div>
          <div className="text-sm text-gray-400 mt-1">heure{hours > 1 ? 's' : ''}</div>
        </div>
        <div className="flex flex-col items-center bg-dark-surface rounded-lg p-4 min-w-[80px] border border-primary/50 shadow-md hover:scale-105 transition-transform" style={{ boxShadow: '0 0 15px rgba(13, 125, 77, 0.3), 0 0 8px rgba(220, 38, 38, 0.2)' }}>
          <div className="text-4xl font-bold bg-gradient-to-br from-primary via-gold to-accent bg-clip-text text-transparent">{minutes}</div>
          <div className="text-sm text-gray-400 mt-1">minute{minutes > 1 ? 's' : ''}</div>
        </div>
        <div className="flex flex-col items-center bg-dark-surface rounded-lg p-4 min-w-[80px] border border-accent/50 shadow-md hover:scale-105 transition-transform" style={{ boxShadow: '0 0 15px rgba(220, 38, 38, 0.3), 0 0 8px rgba(13, 125, 77, 0.2)' }}>
          <div className="text-4xl font-bold bg-gradient-to-br from-accent via-gold to-primary bg-clip-text text-transparent">{seconds}</div>
          <div className="text-sm text-gray-400 mt-1">seconde{seconds > 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  )
}

