import React, { useState, useEffect } from 'react'
import { calculateFloodRisk, getMockWeatherData, riskDescriptions } from '../utils/floodRisk'

export default function RiskIndicator({ riskLevel, location = 'Butuan City', weatherData, showRecommendations = false }) {
  const [currentRisk, setCurrentRisk] = useState(riskLevel || 'safe')
  const [expanded, setExpanded] = useState(false)

  // Calculate risk level from weather data if provided
  useEffect(() => {
    if (weatherData) {
      const calculatedRisk = calculateFloodRisk(weatherData)
      setCurrentRisk(calculatedRisk)
    } else if (riskLevel) {
      setCurrentRisk(riskLevel)
    }
  }, [weatherData, riskLevel])

  const riskConfig = {
    safe: {
      color: '#10b981', // green-500
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      label: 'Safe',
      description: 'No flood risk detected',
      icon: '🟢'
    },
    moderate: {
      color: '#f59e0b', // amber-500
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      label: 'Moderate',
      description: 'Monitor weather conditions',
      icon: '🟡'
    },
    high: {
      color: '#ef4444', // red-500
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      label: 'High',
      description: 'Flood risk detected - Take precautions',
      icon: '🔴'
    }
  }

  const config = riskConfig[currentRisk] || riskConfig.safe
  const descriptions = riskDescriptions[currentRisk] || riskDescriptions.safe

  return (
    <div className="risk-indicator" style={{
      background: config.bgColor,
      border: `2px solid ${config.borderColor}`,
      borderRadius: '12px',
      padding: '16px',
      marginTop: '12px',
      cursor: showRecommendations ? 'pointer' : 'default',
      transition: 'all 0.3s ease'
    }} onClick={() => showRecommendations && setExpanded(!expanded)}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          fontSize: '24px',
          lineHeight: '1'
        }}>
          {config.icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: config.color,
            marginBottom: '4px'
          }}>
            Flood Risk: {config.label}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--muted)',
            lineHeight: '1.4'
          }}>
            {location} - {config.description}
          </div>
        </div>

        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: config.color,
          boxShadow: `0 0 12px ${config.color}40`
        }}></div>

        {showRecommendations && (
          <div style={{
            fontSize: '12px',
            color: 'var(--muted)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            ▼
          </div>
        )}
      </div>

      {showRecommendations && expanded && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: config.color,
            marginBottom: '8px'
          }}>
            Recommendations:
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '16px',
            fontSize: '11px',
            color: 'var(--muted)',
            lineHeight: '1.5'
          }}>
            {descriptions.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}