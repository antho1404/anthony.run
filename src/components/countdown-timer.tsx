'use client';

import { useEffect, useState } from 'react';

export function CountdownTimer() {
  // Set the launch date to May 1st
  const launchDate = new Date('2025-05-01T00:00:00');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 w-full z-5 flex flex-col justify-center items-center pointer-events-none py-2">
      <div className="text-sm md:text-base font-medium text-black/20 mb-1 tracking-wide">OFFICIAL LAUNCH IN</div>
      <div className="flex items-center justify-center text-7xl md:text-9xl font-extrabold text-black/5">
        <div className="flex space-x-2 md:space-x-4">
          <div className="flex flex-col items-center">
            <span>{timeLeft.days.toString().padStart(2, '0')}</span>
            <span className="text-sm font-normal">DAYS</span>
          </div>
          <span>:</span>
          <div className="flex flex-col items-center">
            <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-sm font-normal">HOURS</span>
          </div>
          <span>:</span>
          <div className="flex flex-col items-center">
            <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-sm font-normal">MINS</span>
          </div>
          <span>:</span>
          <div className="flex flex-col items-center">
            <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-sm font-normal">SECS</span>
          </div>
        </div>
      </div>
    </div>
  );
}