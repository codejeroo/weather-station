/**
 * Determine flood risk level based on precipitation chance and hazard zone
 * Checks precipitation probability first - if < 80%, defaults to safe
 * Otherwise uses hazard zone from floodMap.json for risk assessment
 * @param {Object} weatherData - Weather data object with precipitationChance
 * @param {number|null} hazardZone - Var value from flood map
 * @returns {string} 'safe', 'moderate', or 'high'
 */
export function calculateFloodRisk(weatherData, hazardZone = null) {
  // If weather data exists, check precipitation chance first
  if (weatherData && weatherData.precipitationChance !== undefined) {
    // If precipitation chance is less than 80%, default to safe
    if (weatherData.precipitationChance < 80) {
      return 'safe'
    }
    
    // If precipitation chance >= 80%, use hazard zone to determine risk level
    if (hazardZone !== null && hazardZone !== undefined) {
      if (hazardZone >= 1) {
        return 'high'
      } else if (hazardZone === 0) {
        return 'moderate'
      } else {
        return 'safe'
      }
    }
    
    // Default to moderate if high precipitation chance but no hazard zone data
    return 'moderate'
  }

  // If no weather data, use hazard zone only
  if (hazardZone !== null && hazardZone !== undefined) {
    if (hazardZone >= 1) {
      return 'high'
    } else if (hazardZone === 0) {
      return 'moderate'
    } else {
      return 'safe'
    }
  }

  // Fallback: default to safe
  return 'safe'
}

// Mock weather data based on flood map data (no randomness)
// This should be replaced with real API data linked to actual flood hazard zones
let lastWeatherData = null
let lastUpdateTime = 0

/**
 * Generate mock weather data based on time of day and hazard zone
 * @param {number|null} hazardZone - Optional flood hazard zone from floodMap
 * @returns {Object} Weather data with stable, predictable values
 */
export function getMockWeatherData(hazardZone = null) {
  const now = Date.now()
  
  // Return cached data for 10 seconds to prevent flickering
  if (lastWeatherData && (now - lastUpdateTime) < 10000) {
    return lastWeatherData
  }
  
  // Use hazard zone to determine base weather characteristics
  // Areas in higher-risk zones (lower Var values) should have more realistic flood conditions
  let basePrecipitation = 8 // mm, normal dry conditions
  let baseHumidity = 75    // %
  let baseWindSpeed = 8    // km/h
  let baseTemp = 27        // °C
  
  // Adjust based on hazard zone (higher risk areas may need different baseline)
  if (hazardZone !== null && hazardZone <= -2) {
    // High-risk flood zone - set to realistic dry/stable conditions
    basePrecipitation = 5
    baseHumidity = 70
  }
  
  // Apply time-of-day variations (stable, predictable)
  const hour = new Date().getHours()
  const seasonalAdjustment = Math.sin((hour - 12) * Math.PI / 12) // -1 to 1
  const minuteOfDay = new Date().getMinutes() / 60 // smooth intra-hour variation
  
  // Generate stable weather without randomness
  lastWeatherData = {
    precipitation: Math.max(0, basePrecipitation + seasonalAdjustment * 2),
    humidity: Math.max(0, Math.min(100, baseHumidity + seasonalAdjustment * 3 + minuteOfDay * 1.5)),
    windSpeed: Math.max(0, baseWindSpeed + seasonalAdjustment * 2),
    temperature: baseTemp + seasonalAdjustment * 2.5 + minuteOfDay * 0.5,
    elevation: 45,
    // Precipitation chance: low chance in morning/evening, higher at noon
    // Returns 0-100%
    precipitationChance: Math.max(10, Math.min(90, (seasonalAdjustment + 1) * 40 + minuteOfDay * 10))
  }
  
  lastUpdateTime = now
  return lastWeatherData
}

// Risk level descriptions for UI
export const riskDescriptions = {
  safe: {
    title: 'Safe',
    description: 'No flood risk detected',
    recommendations: ['Normal activities', 'Monitor weather updates']
  },
  moderate: {
    title: 'Moderate Risk',
    description: 'Monitor weather conditions',
    recommendations: ['Stay alert', 'Prepare emergency kit', 'Monitor local news']
  },
  high: {
    title: 'High Risk',
    description: 'Flood risk detected - Take precautions',
    recommendations: ['Move to higher ground', 'Follow evacuation orders', 'Contact emergency services']
  }
}