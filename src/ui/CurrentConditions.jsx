import React, { useState, useEffect } from 'react'
import { Sun, Cloud, CloudRain, Calendar } from 'lucide-react'
import { fetchSensorLogs } from '../utils/sensorLogs'

export default function CurrentConditions() {
  const [weatherData, setWeatherData] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    const loadSensorData = async () => {
      const logs = await fetchSensorLogs(1)
      if (logs.length > 0) {
        const latestLog = logs[0]
        setWeatherData({
          temperature: latestLog.temperature ?? 0,
          humidity: latestLog.humidity ?? 0,
          precipitation: latestLog.pressure ?? 0,
          pressure: latestLog.pressure ?? 0,
          altitude: latestLog.altitude ?? 0
        })
      }
    }
    
    loadSensorData()
    const interval = setInterval(loadSensorData, 300000)
    return () => clearInterval(interval)
  }, [])

  // Determine weather icon based on precipitation and cloud coverage
  function getWeatherIcon() {
    if (!weatherData) return <Sun size={80} strokeWidth={1.5} />
    
    const { precipitation, humidity } = weatherData
    
    // Rain
    if (precipitation > 30) return <CloudRain size={80} strokeWidth={1.5} />
    // Cloudy
    if (precipitation > 10 || humidity > 85) return <Cloud size={80} strokeWidth={1.5} />
    // Sunny
    return <Sun size={80} strokeWidth={1.5} />
  }

  function handleDateChange(e) {
    setSelectedDate(new Date(e.target.value))
    setShowDatePicker(false)
  }

  const temp = weatherData ? Math.round(weatherData.temperature) : '--'
  const humidity = weatherData ? Math.round(weatherData.humidity) : '--'
  const precipitation = weatherData ? Math.round(weatherData.precipitation * 10) / 10 : '--'

  return (
    <section className="card current-conditions-card">
      {/* Date Picker Dropdown - Top Right */}
      <div className="date-picker-container">
        <button
          className="date-picker-btn"
          onClick={() => setShowDatePicker(!showDatePicker)}
          title="Select date"
        >
          <Calendar size={16} style={{ display: 'inline-block', marginRight: '0.25rem' }} />
          {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </button>
        
        {showDatePicker && (
          <div className="date-picker-dropdown">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="date-input"
            />
          </div>
        )}
      </div>

      {/* Hero Content */}
      <div className="conditions-content">
        {/* Weather Icon */}
        <div className="weather-icon">
          {getWeatherIcon()}
        </div>

        {/* Temperature */}
        <div className="temperature-display">
          <span className="temp-value">{temp}</span>
          <span className="temp-unit">°C</span>
        </div>

        {/* Additional Metrics */}
        <div className="metrics-row">
          <div className="metric">
            <span className="metric-label">Humidity</span>
            <span className="metric-value">{humidity}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Precipitation</span>
            <span className="metric-value">{precipitation} mm</span>
          </div>
        </div>
      </div>
    </section>
  )
}
