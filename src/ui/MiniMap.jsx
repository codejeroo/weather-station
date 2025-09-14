import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import RiskIndicator from './RiskIndicator'
import { getMockWeatherData } from '../utils/floodRisk'

// Fix for default markers in Leaflet with React
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function MiniMap() {
  // Coordinates for Butuan City, Philippines
  const position = [8.9489, 125.5436]

  const [weatherData, setWeatherData] = useState(null)
  const [showRecommendations, setShowRecommendations] = useState(false)

  // Simulate real-time weather data updates
  useEffect(() => {
    // Initial data
    setWeatherData(getMockWeatherData())

    // Update weather data every 30 seconds for demo
    const interval = setInterval(() => {
      setWeatherData(getMockWeatherData())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mini-map card">
      <h3>Station Location</h3>
      <MapContainer center={position} zoom={12} style={{ height: '220px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            <strong>Butuan City, Philippines</strong><br />
            Weather Station Location<br />
            Coordinates: 8.9489° N, 125.5436° E
          </Popup>
        </Marker>
      </MapContainer>

      <RiskIndicator
        weatherData={weatherData}
        location="Butuan City"
        showRecommendations={showRecommendations}
      />

      <div style={{
        marginTop: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setShowRecommendations(!showRecommendations)}
          style={{
            fontSize: '11px',
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: 'var(--text)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {showRecommendations ? 'Hide' : 'Show'} Recommendations
        </button>

        {weatherData && (
          <div style={{
            fontSize: '10px',
            color: 'var(--muted)',
            textAlign: 'right'
          }}>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}