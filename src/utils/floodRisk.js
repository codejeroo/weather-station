// Utility function to determine flood risk level based on weather conditions
export function calculateFloodRisk(weatherData) {
  if (!weatherData) return 'safe'

  const { precipitation, humidity, windSpeed, temperature } = weatherData

  // High risk conditions
  if (precipitation > 50 || (humidity > 90 && precipitation > 20)) {
    return 'high'
  }

  // Moderate risk conditions
  if (precipitation > 20 || (humidity > 80 && precipitation > 10) || windSpeed > 30) {
    return 'moderate'
  }

  // Safe conditions
  return 'safe'
}

// Mock weather data for testing (replace with real API data)
export function getMockWeatherData() {
  return {
    precipitation: Math.random() * 60, // mm
    humidity: 60 + Math.random() * 35, // %
    windSpeed: Math.random() * 40, // km/h
    temperature: 25 + Math.random() * 10 // °C
  }
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