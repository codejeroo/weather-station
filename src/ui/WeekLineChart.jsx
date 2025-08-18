import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { day: 'Mon', temp: 22, hum: 58 },
  { day: 'Tue', temp: 24, hum: 55 },
  { day: 'Wed', temp: 23, hum: 57 },
  { day: 'Thu', temp: 25, hum: 53 },
  { day: 'Fri', temp: 26, hum: 50 },
  { day: 'Sat', temp: 24, hum: 52 },
  { day: 'Sun', temp: 23, hum: 56 }
]

export default function WeekLineChart() {
  return (
    <div className="week-chart card">
      <h2>Past week data</h2>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="day" stroke="#9fb7d6" />
            <YAxis stroke="#9fb7d6" />
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
