import React, { useState, useEffect } from 'react'
import { calculatePrecipitationChance } from '../utils/sensorLogs'

export default function PercentCard() {
  const [chance, setChance] = useState(0)

  useEffect(() => {
    const loadPrecipitationChance = async () => {
      const precipChance = await calculatePrecipitationChance()
      setChance(Math.round(precipChance))
    }
    loadPrecipitationChance()
    const interval = setInterval(loadPrecipitationChance, 300000)
    return () => clearInterval(interval)
  }, [])

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (chance / 100) * circumference

  return (
    <section className="card percent-card">
      <h2>Precipitation Chance</h2>
      <div className="percent-circle">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <g transform="translate(50,50)">
            <circle r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle r="40" fill="none" stroke="url(#grad)" strokeWidth="10" strokeDasharray={`${circumference}`} strokeDashoffset={`${offset}`} strokeLinecap="round" transform="rotate(-90)" />
            <defs>
              <linearGradient id="grad" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <text x="0" y="6" textAnchor="middle" fontSize="18" fill="var(--text)">{`${chance}%`}</text>
          </g>
        </svg>
      </div>
    </section>
  )
}
