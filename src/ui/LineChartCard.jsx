import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fetchSensorLogs } from '../utils/sensorLogs'

export default function LineChartCard() {
  const [data, setData] = useState([])

  useEffect(() => {
    const loadTodayData = async () => {
      const logs = await fetchSensorLogs(100)
      
      // Group data by hour for today
      const hourlyData = {}
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      logs.forEach(log => {
        const logDate = new Date(log.created_at)
        logDate.setMinutes(0, 0, 0)
        
        // Only include data from today
        if (logDate.toDateString() === today.toDateString()) {
          const timeKey = logDate.getHours() + 'h'
          
          if (!hourlyData[timeKey]) {
            hourlyData[timeKey] = { temps: [], hums: [], time: timeKey }
          }
          if (log.temperature) hourlyData[timeKey].temps.push(log.temperature)
          if (log.humidity) hourlyData[timeKey].hums.push(log.humidity)
        }
      })
      
      const chartData = Object.values(hourlyData)
        .map(d => ({
          time: d.time,
          temp: d.temps.length > 0 ? Math.round(d.temps.reduce((a, b) => a + b) / d.temps.length * 10) / 10 : 0,
          hum: d.hums.length > 0 ? Math.round(d.hums.reduce((a, b) => a + b) / d.hums.length * 10) / 10 : 0
        }))
        .sort((a, b) => parseInt(a.time) - parseInt(b.time))
      
      setData(chartData.length > 0 ? chartData : [
        { time: '0h', temp: 0, hum: 0 },
        { time: '12h', temp: 0, hum: 0 }
      ])
    }
    loadTodayData()
    const interval = setInterval(loadTodayData, 60000)
    return () => clearInterval(interval)
  }, [])
  return (
    <section className="card chart-card">
      <h2>Humidity & Temperature (24hrs)</h2>
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="time" stroke="#9fb7d6" />
            <YAxis stroke="#9fb7d6" domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temp" stroke="#fb923c" strokeWidth={2} name="Temperature (°C)" />
            <Line type="monotone" dataKey="hum" stroke="#60a5fa" strokeWidth={2} name="Humidity (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
