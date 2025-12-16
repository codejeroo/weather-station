import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fetchSensorLogs } from '../utils/sensorLogs'

export default function WeekLineChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    const loadWeekData = async () => {
      const logs = await fetchSensorLogs(168) // ~7 days of hourly data
      
      // Group data by day and calculate daily averages
      const dailyData = {}
      logs.forEach(log => {
        const date = new Date(log.created_at)
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' })
        
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = { temps: [], hums: [], day: dayKey }
        }
        if (log.temperature) dailyData[dayKey].temps.push(log.temperature)
        if (log.humidity) dailyData[dayKey].hums.push(log.humidity)
      })
      
      // Calculate averages and format for chart
      const chartData = Object.values(dailyData).map(d => ({
        day: d.day,
        temp: d.temps.length > 0 ? Math.round(d.temps.reduce((a, b) => a + b) / d.temps.length * 10) / 10 : 0,
        hum: d.hums.length > 0 ? Math.round(d.hums.reduce((a, b) => a + b) / d.hums.length * 10) / 10 : 0
      }))
      
      setData(chartData.length > 0 ? chartData : [
        { day: 'Mon', temp: 0, hum: 0 },
        { day: 'Tue', temp: 0, hum: 0 }
      ])
    }
    loadWeekData()
    const interval = setInterval(loadWeekData, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="week-chart card">
      <h2>Past week data</h2>
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="day" stroke="#9fb7d6" />
            <YAxis stroke="#9fb7d6" domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temp" stroke="#fb923c" strokeWidth={2} />
            <Line type="monotone" dataKey="hum" stroke="#60a5fa" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
