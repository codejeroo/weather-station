import React, { useState, useEffect } from 'react'
import { calculateFloodRisk, getMockWeatherData, riskDescriptions } from '../utils/floodRisk'
import { getHazardZoneColor } from '../utils/geospatial'

export default function RiskIndicator({ riskLevel, location = 'Butuan City', weatherData, showRecommendations = false, hazardZone = null }) {
  const [currentRisk, setCurrentRisk] = useState(riskLevel || 'safe')
  const [expanded, setExpanded] = useState(false)
  const [hazardLabel, setHazardLabel] = useState('')
  const [hazardColor, setHazardColor] = useState('')

  // Calculate risk level from weather data if provided
  useEffect(() => {
    // Get hazard label and color
    if (hazardZone !== null && hazardZone !== undefined) {
      if (hazardZone >= 3) {
        setHazardLabel('Extreme Flood Risk Zone')
      } else if (hazardZone === 2) {
        setHazardLabel('Very High Flood Risk Zone')
      } else if (hazardZone === 1) {
        setHazardLabel('High Flood Risk Zone')
      } else if (hazardZone === 0) {
        setHazardLabel('Moderate Flood Risk Zone')
      } else if (hazardZone === -1) {
        setHazardLabel('Low Flood Risk Zone')
      } else if (hazardZone === -2) {
        setHazardLabel('No Flood Risk Area')
      } else if (hazardZone < -2) {
        setHazardLabel('No Flood Risk Area')
      } else {
        setHazardLabel('No Hazard Zone')
      }
      setHazardColor(getHazardZoneColor(hazardZone))
    } else {
      setHazardLabel('No Hazard Zone')
      setHazardColor('#10b981')
    }

    // Calculate weather risk based on hazard zone (new function signature)
    let calculatedRisk = 'safe'
    if (weatherData) {
      // Pass hazard zone to calculateFloodRisk for integrated assessment
      calculatedRisk = calculateFloodRisk(weatherData, hazardZone)
    } else if (riskLevel) {
      calculatedRisk = riskLevel
    }

    setCurrentRisk(calculatedRisk)
  }, [weatherData, riskLevel, hazardZone])

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
            lineHeight: '1.4',
            marginBottom: '8px'
          }}>
            {location} - {config.description}
          </div>
          {hazardLabel && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontWeight: '500',
              color: hazardColor,
              padding: '6px 8px',
              background: `${hazardColor}15`,
              borderRadius: '4px',
              border: `1px solid ${hazardColor}40`,
              width: 'fit-content'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: hazardColor,
                boxShadow: `0 0 6px ${hazardColor}80`
              }}></div>
              <span>{hazardLabel}</span>
            </div>
          )}
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