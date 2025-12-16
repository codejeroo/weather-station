import React, { useState, useEffect } from 'react'
import { fetchSensorLogs } from '../utils/sensorLogs'

export default function BarChartCard() {
  const [items, setItems] = useState([
    { label: 'Humidity', value: '--', unit: '%', color: '#60a5fa', type: 'percentage' },
    { label: 'Temperature', value: '--', unit: '°C', color: '#fb923c', type: 'thermometer' },
    { label: 'Soil Moisture', value: '--', unit: '%', color: '#10b981', type: 'percentage' },
    { label: 'Altitude', value: '--', unit: 'm', color: '#a78bfa', type: 'absolute' }
  ])

  useEffect(() => {
    const loadLatestSensorData = async () => {
      const logs = await fetchSensorLogs(1)
      if (logs.length > 0) {
        const latestLog = logs[0]
        const formatValue = (val) => val === null || val === undefined ? '--' : Number(val).toFixed(2)
        
        setItems([
          { label: 'Humidity', value: formatValue(latestLog.humidity), unit: '%', color: '#60a5fa', type: 'percentage' },
          { label: 'Temperature', value: formatValue(latestLog.temperature), unit: '°C', color: '#fb923c', type: 'thermometer' },
          { label: 'Soil Moisture', value: formatValue(latestLog.soil_moisture), unit: '%', color: '#10b981', type: 'percentage' },
          { label: 'Altitude', value: formatValue(latestLog.altitude), unit: 'm', color: '#a78bfa', type: 'absolute' }
        ])
      }
    }
    loadLatestSensorData()
    const interval = setInterval(loadLatestSensorData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate width based on type
  const getBarWidth = (item) => {
    if (item.type === 'percentage') {
      return `${Math.min(item.value, 100)}%`
    } else if (item.type === 'thermometer') {
      // For temperature, normalize to 0-40°C range
      const tempRange = 40 // 0-40°C
      return `${(item.value / tempRange) * 100}%`
    } else {
      // For absolute values, use relative scaling
      const max = Math.max(...items.filter(i => i.type === 'absolute').map(i => i.value), 1)
      return `${(item.value / max) * 100}%`
    }
  }

  const ThermometerBar = ({ item }) => {
    const tempRange = 40 // 0-40°C
    const fillHeight = (item.value / tempRange) * 100
    const isHot = item.value > 25

    return (
      <div className="thermometer-container" style={{
        position: 'relative',
        width: '100%',
        height: '24px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {/* Thermometer bulb */}
        <div style={{
          position: 'absolute',
          right: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: isHot ? '#ef4444' : '#3b82f6',
          border: '2px solid rgba(255,255,255,0.2)',
          zIndex: 2
        }}></div>

        {/* Temperature fill */}
        <div style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: `${fillHeight}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${isHot ? '#ef4444' : '#3b82f6'}, ${isHot ? '#dc2626' : '#1d4ed8'})`,
          borderRadius: '12px 0 0 12px',
          transition: 'width 0.5s ease'
        }}></div>

        {/* Temperature markings */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '25%',
          width: '1px',
          height: '8px',
          background: 'rgba(255,255,255,0.3)',
          transform: 'translateY(-50%)'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '1px',
          height: '8px',
          background: 'rgba(255,255,255,0.3)',
          transform: 'translateY(-50%)'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '75%',
          width: '1px',
          height: '8px',
          background: 'rgba(255,255,255,0.3)',
          transform: 'translateY(-50%)'
        }}></div>
      </div>
    )
  }

  return (
    <section className="card bar-card">
      <h2>Values</h2>
      <div className="bar-list">
        {items.map(it => (
          <div className="bar-row" key={it.label}>
            <div className="row-label">{it.label}</div>
            <div className="row-bar">
              {it.type === 'thermometer' ? (
                <ThermometerBar item={it} />
              ) : (
                <div
                  className="row-fill"
                  style={{
                    width: getBarWidth(it),
                    background: it.color,
                    transition: 'width 0.5s ease'
                  }}
                  title={`${it.label}: ${it.value}${it.unit}`}
                />
              )}
            </div>
            <div className="row-value">{it.value}{it.unit}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
