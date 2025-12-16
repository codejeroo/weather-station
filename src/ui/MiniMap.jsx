import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import RiskIndicator from './RiskIndicator'
import FloodRiskOverlay from './FloodRiskOverlay'
import { getMockWeatherData } from '../utils/floodRisk'
import { getStationHazardZone } from '../utils/geospatial'
import floodMapData from '../data/floodMap.json'

// Fix for default markers in Leaflet with React
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function MiniMap() {
  // Coordinates for Butuan City, Philippines (Updated: 8.957368, 125.600514)
  const position = [8.957368, 125.600514]

  const [weatherData, setWeatherData] = useState(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [currentHazardZone, setCurrentHazardZone] = useState(null)
  const [showFloodMap, setShowFloodMap] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapContainerRef = React.useRef(null)

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

  // Automatically determine hazard zone based on station location
  useEffect(() => {
    const hazardZone = getStationHazardZone(
      [position[1], position[0]], // Convert [lat, lng] to [lng, lat] for Turf
      floodMapData
    )
    setCurrentHazardZone(hazardZone)
  }, [])

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return

    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen()
      } else if (mapContainerRef.current.webkitRequestFullscreen) {
        mapContainerRef.current.webkitRequestFullscreen()
      } else if (mapContainerRef.current.msRequestFullscreen) {
        mapContainerRef.current.msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen()
      } else if (document.msFullscreenElement) {
        document.msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // Get hazard color based on Var value
  const getHazardColor = (varValue) => {
    if (varValue >= 3) return '#8B0000' // dark red
    if (varValue === 2) return '#DC143C' // crimson
    if (varValue === 1) return '#FF8C00' // orange
    if (varValue === 0) return '#FFD700' // gold
    return '#10b981' // green for negative values
  }

  // Get hazard label based on Var value
  const getHazardLabel = (varValue) => {
    if (varValue >= 3) return 'Extreme Flood Risk Zone'
    if (varValue === 2) return 'Very High Flood Risk Zone'
    if (varValue === 1) return 'High Flood Risk Zone'
    if (varValue === 0) return 'Moderate Flood Risk Zone'
    return 'Low Flood Risk Zone'
  }

  // Style each GeoJSON feature
  const onEachFeature = (feature, layer) => {
    const varValue = feature.properties.Var
    const hazardLabel = getHazardLabel(varValue)
    
    layer.setStyle({
      color: getHazardColor(varValue),
      weight: 2,
      opacity: 0.3,
      fillOpacity: 0.3
    })

    // Add hover effects
    layer.on('mouseover', () => {
      layer.setStyle({
        opacity: 0.8,
        fillOpacity: 0.6,
        weight: 3
      })
      layer.bringToFront()
    })

    layer.on('mouseout', () => {
      layer.setStyle({
        opacity: 0.3,
        fillOpacity: 0.3,
        weight: 2
      })
    })

    // Click handler to set current hazard zone
    layer.on('click', () => {
      setCurrentHazardZone(varValue)
    })

    // Add popup
    const popupContent = `<strong>${hazardLabel}</strong><br/>Area: ${feature.properties.Muncode}`
    layer.bindPopup(popupContent)
  }

  return (
    <div className="mini-map card" ref={mapContainerRef} style={isFullscreen ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, borderRadius: 0, margin: 0, padding: 0 } : {}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isFullscreen ? '0' : '0.5rem', padding: isFullscreen ? '12px 16px' : '0' }}>
        <h3 style={{ margin: 0, color: isFullscreen ? 'white' : 'inherit', textShadow: isFullscreen ? '0 2px 4px rgba(0,0,0,0.3)' : 'none' }}>Station Location</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {weatherData && (
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>
              Station Altitude: {weatherData.elevation}m
            </span>
          )}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              color: 'var(--text)',
              fontSize: '12px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--accent)'
              e.target.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none'
              e.target.style.color = 'var(--text)'
            }}
          >
            {isFullscreen ? '⊡' : '⛶'}
          </button>
        </div>
      </div>
      <div style={{ position: 'relative', height: isFullscreen ? 'calc(100vh - 44px)' : '220px', width: '100%' }}>
        <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {showFloodMap && <GeoJSON data={floodMapData} onEachFeature={onEachFeature} />}
          <FloodRiskOverlay position={position} weatherData={weatherData} />
          <Marker position={position}>
            <Popup>
              <strong>Station Location: 8.957368°N, 125.600514°E</strong><br />
              <strong>Butuan City, Philippines</strong><br />
              Weather Station Location<br />
              Coordinates: 8.957368° N, 125.600514° E
            </Popup>
          </Marker>
        </MapContainer>

        {/* Flood Hazard Legend (Bottom-Left) */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          background: document.documentElement.getAttribute('class')?.includes('theme-dark') 
            ? 'rgba(30, 41, 59, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 400,
          fontSize: '12px',
          fontWeight: '500',
          color: document.documentElement.getAttribute('class')?.includes('theme-dark')
            ? '#e5e7eb'
            : '#0f172a',
          backdropFilter: 'blur(4px)',
          border: document.documentElement.getAttribute('class')?.includes('theme-dark')
            ? '1px solid rgba(96, 165, 250, 0.2)'
            : 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontWeight: '600', fontSize: '13px' }}>
              Flood Hazard Zones
            </div>
            <button
              onClick={() => setShowFloodMap(!showFloodMap)}
              style={{
                background: showFloodMap ? 'var(--accent)' : (document.documentElement.getAttribute('class')?.includes('theme-dark') ? 'rgba(96, 165, 250, 0.15)' : 'rgba(255, 255, 255, 0.2)'),
                color: showFloodMap ? 'white' : (document.documentElement.getAttribute('class')?.includes('theme-dark') ? '#e5e7eb' : '#0f172a'),
                border: '1px solid ' + (showFloodMap ? 'var(--accent)' : (document.documentElement.getAttribute('class')?.includes('theme-dark') ? 'rgba(96, 165, 250, 0.3)' : 'rgba(0, 0, 0, 0.2)')),
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.8'
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1'
              }}
            >
              {showFloodMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
          {showFloodMap && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { var: 3, label: 'Extreme Risk', color: '#8B0000' },
                { var: 2, label: 'Very High Risk', color: '#DC143C' },
                { var: 1, label: 'High Risk', color: '#FF8C00' },
                { var: 0, label: 'Moderate Risk', color: '#FFD700' },
                { var: -1, label: 'Low Risk', color: '#10b981' }
              ].map((item) => (
                <div key={item.var} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: item.color,
                      borderRadius: '2px',
                      opacity: 0.6
                    }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Source Label (Top-Right) */}
        <div style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 400,
          fontSize: '11px',
          fontWeight: '500',
          color: 'var(--text)',
          backdropFilter: 'blur(4px)',
          whiteSpace: 'nowrap'
        }}>
          Flood Risk Map Source: <strong>LIDAR</strong>
        </div>
      </div>

      <RiskIndicator
        weatherData={weatherData}
        location="Butuan City"
        showRecommendations={showRecommendations}
        hazardZone={currentHazardZone}
        style={{ display: isFullscreen ? 'none' : 'block' }}
      />

      <div style={{
        marginTop: '8px',
        display: isFullscreen ? 'none' : 'flex',
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