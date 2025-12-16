import React, { useState, useEffect } from 'react'
import { fetchSensorLogs } from '../utils/sensorLogs'

export default function SensorLogsTable() {
  const [sensorLogs, setSensorLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadSensorLogs = async () => {
      setLoading(true)
      setError(null)
      const logs = await fetchSensorLogs(20)
      setSensorLogs(logs)
      setLoading(false)
    }

    loadSensorLogs()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A'
    return Number(num).toFixed(2)
  }

  if (loading) {
    return (
      <section className="card">
        <h2>Sensor Logs</h2>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Loading sensor data...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="card">
        <h2>Sensor Logs</h2>
        <div style={{ padding: '20px', color: '#ef4444' }}>
          Error loading sensor data: {error}
        </div>
      </section>
    )
  }

  if (sensorLogs.length === 0) {
    return (
      <section className="card">
        <h2>Sensor Logs</h2>
        <div style={{ padding: '20px', textAlign: 'center', color: '#9fb7d6' }}>
          No sensor data available yet
        </div>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>Sensor Logs</h2>
      <div style={{ overflowX: 'auto', marginTop: '15px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '10px', textAlign: 'left', color: '#60a5fa' }}>Node ID</th>
              <th style={{ padding: '10px', textAlign: 'left', color: '#60a5fa' }}>Temp (°C)</th>
              <th style={{ padding: '10px', textAlign: 'left', color: '#60a5fa' }}>Humidity (%)</th>
              <th style={{ padding: '10px', textAlign: 'left', color: '#60a5fa' }}>Pressure (hPa)</th>
              <th style={{ padding: '10px', textAlign: 'left', color: '#60a5fa' }}>Soil Moisture (%)</th>
              <th style={{ padding: '10px', textAlign: 'left', color: '#60a5fa' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {sensorLogs.map((log) => (
              <tr
                key={log.id}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  hover: { backgroundColor: 'rgba(255,255,255,0.05)' }
                }}
              >
                <td style={{ padding: '10px', color: '#e5e7eb' }}>{log.node_id}</td>
                <td style={{ padding: '10px', color: '#fb923c' }}>{formatNumber(log.temperature)}</td>
                <td style={{ padding: '10px', color: '#60a5fa' }}>{formatNumber(log.humidity)}</td>
                <td style={{ padding: '10px', color: '#34d399' }}>{formatNumber(log.pressure)}</td>
                <td style={{ padding: '10px', color: '#a78bfa' }}>{formatNumber(log.soil_moisture)}</td>
                <td style={{ padding: '10px', color: '#9fb7d6', fontSize: '0.85rem' }}>
                  {formatDate(log.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
