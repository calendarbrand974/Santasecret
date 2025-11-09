'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  targetDate: Date
  timeZone: string
  onComplete?: () => void
}

export function Countdown({ targetDate, timeZone, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)
  
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const target = new Date(targetDate)
      const diff = target.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        if (onComplete) onComplete()
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
  }, [targetDate, onComplete])
  
  if (!timeLeft) {
    return <div className="text-center">Chargement...</div>
  }
  
  const { days, hours, minutes, seconds } = timeLeft
  
  return (
    <div className="text-center">
      <div className="text-2xl font-bold mb-2">Ouverture du tirage dans :</div>
      <div className="flex gap-4 justify-center">
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-primary">{days}</div>
          <div className="text-sm text-gray-400">jours</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-primary">{hours}</div>
          <div className="text-sm text-gray-400">heures</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-primary">{minutes}</div>
          <div className="text-sm text-gray-400">minutes</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-primary">{seconds}</div>
          <div className="text-sm text-gray-400">secondes</div>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        Fuseau horaire : {timeZone}
      </div>
    </div>
  )
}

