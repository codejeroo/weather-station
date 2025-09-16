import React from 'react'
import { Circle } from 'react-leaflet'
import { calculateFloodRisk } from '../utils/floodRisk'

export default function FloodRiskOverlay({ position, weatherData, radius = 3000 }) {
  if (!weatherData) return null

  const riskLevel = calculateFloodRisk(weatherData)
  
  // Define colors for each risk level with low opacity
  const getColorForRisk = (risk) => {
    switch (risk) {
      case 'high':
        return '#ff4444' // Red
      case 'moderate':
        return '#ffaa00' // Yellow/Orange
      case 'safe':
      default:
        return '#44ff44' // Green
    }
  }

  const fillColor = getColorForRisk(riskLevel)

  // Create multiple concentric circles for better visual effect
  const circles = [
    { radius: radius * 0.5, opacity: 0.3, fillOpacity: 0.15 },
    { radius: radius * 0.75, opacity: 0.25, fillOpacity: 0.1 },
    { radius: radius, opacity: 0.2, fillOpacity: 0.05 }
  ]

  return (
    <>
      {circles.map((circle, index) => (
        <Circle
          key={index}
          center={position}
          radius={circle.radius}
          pathOptions={{
            color: fillColor,
            fillColor: fillColor,
            fillOpacity: circle.fillOpacity,
            weight: 2,
            opacity: circle.opacity
          }}
        />
      ))}
    </>
  )
}