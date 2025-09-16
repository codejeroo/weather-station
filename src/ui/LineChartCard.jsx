import React from 'react'

// Lightweight SVG line chart for two series (humidity and temperature)
export default function LineChartCard() {
  // Dummy data
  const labels = ['0h','3h','6h','9h','12h','15h','18h','21h']
  const temp = [20,22,24,26,25,23,21,20]
  const hum = [60,58,55,50,48,52,57,60]

  // Normalize for svg height
  const toPoints = (arr) => arr.map((v,i) => `${(i/(arr.length-1))*100},${100 - (v - Math.min(...arr))/(Math.max(...arr)-Math.min(...arr))*100}`)
  const tPoints = toPoints(temp).join(' ')
  const hPoints = toPoints(hum).join(' ')

  return (
    <section className="card chart-card">
      <h2>Humidity & Temperature(24hrs)</h2>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart">
        <polyline points={hPoints} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={tPoints} fill="none" stroke="#fb923c" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="labels">
        {labels.map(l => <span key={l}>{l}</span>)}
      </div>
    </section>
  )
}
