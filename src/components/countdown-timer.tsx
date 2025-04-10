'use client'

import { useEffect, useState } from "react"

interface CountdownProps {
  targetDate: Date
}

export function CountdownTimer({ targetDate }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()
      
      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      setTimeRemaining({ days, hours, minutes, seconds })
    }

    calculateTimeRemaining()
    const timer = setInterval(calculateTimeRemaining, 1000)
    
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex items-center justify-center space-x-4 text-sm md:text-base font-medium mt-2 mb-6">
      <p className="text-muted-foreground">Official launch in:</p>
      <div className="flex space-x-2">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">{timeRemaining.days}</span>
          <span className="text-xs text-muted-foreground">Days</span>
        </div>
        <span className="text-xl">:</span>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">{timeRemaining.hours}</span>
          <span className="text-xs text-muted-foreground">Hours</span>
        </div>
        <span className="text-xl">:</span>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">{timeRemaining.minutes}</span>
          <span className="text-xs text-muted-foreground">Min</span>
        </div>
        <span className="text-xl">:</span>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">{timeRemaining.seconds}</span>
          <span className="text-xs text-muted-foreground">Sec</span>
        </div>
      </div>
    </div>
  )
}