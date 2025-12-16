import React, { useState, useEffect } from 'react'
import { Bot, Thermometer, Droplets, Wind, CloudRain } from 'lucide-react'
import { getMockWeatherData } from '../utils/floodRisk'

export default function AIInsight() {
  const [weatherData, setWeatherData] = useState(null)
  const [insight, setInsight] = useState('')

  useEffect(() => {
    // Get initial weather data
    setWeatherData(getMockWeatherData())
    
    // Update every 30 seconds
    const interval = setInterval(() => {
      setWeatherData(getMockWeatherData())
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!weatherData) return

    // Generate AI insights based on weather data
    const { temperature, humidity, windSpeed, precipitation } = weatherData
    const insights = []

    // Temperature insights
    if (temperature > 28) {
      insights.push('Temperature is quite high. Stay hydrated and seek shade.')
    } else if (temperature > 25) {
      insights.push('Warm conditions. Good day for outdoor activities.')
    } else if (temperature < 18) {
      insights.push('Cool weather. Consider bringing a light jacket.')
    } else {
      insights.push('Temperature is comfortable and pleasant.')
    }

    // Humidity insights
    if (humidity > 80) {
      insights.push('High humidity levels. Air feels muggy and uncomfortable.')
    } else if (humidity > 60) {
      insights.push('Moderate humidity. Typical for this time of day.')
    } else {
      insights.push('Low humidity. Air is dry and comfortable.')
    }

    // Wind insights
    if (windSpeed > 25) {
      insights.push('Strong winds detected. Be cautious with outdoor activities.')
    } else if (windSpeed > 15) {
      insights.push('Moderate winds. Good conditions for outdoor sports.')
    }

    // Precipitation insights
    if (precipitation > 40) {
      insights.push('Heavy rainfall expected. Carry an umbrella and avoid flooding areas.')
    } else if (precipitation > 20) {
      insights.push('Significant chance of rain. Keep an umbrella handy.')
    } else if (precipitation > 5) {
      insights.push('Light rain possible. Monitor the weather.')
    }

    // Combine insights
    const finalInsight = insights.slice(0, 2).join(' ')
    setInsight(finalInsight)
  }, [weatherData])

  return (
    <div className="ai-insight-banner">
      <div className="insight-icon">
        <Bot size={24} />
      </div>
      <div className="insight-content">
        <div className="insight-label">AI Insight</div>
        <div className="insight-text">
          {insight || 'Loading weather analysis...'}
        </div>
      </div>
    </div>
  )
}
