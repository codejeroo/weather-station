import React from 'react'

export default function BarChartCard() {
  const items = [
    { label: 'Humidity', value: 60, unit: '%', color: '#60a5fa' },
    { label: 'Temperature', value: 24, unit: '°C', color: '#fb923c' },
    { label: 'Elevation', value: 1200, unit: 'm', color: '#a78bfa' }
  ]

  // Use the numeric max to set relative widths
  const max = Math.max(...items.map(i => i.value), 1)

  return (
    <section className="card bar-card">
      <h2>Values</h2>
      <div className="bar-list">
        {items.map(it => (
          <div className="bar-row" key={it.label}>
            <div className="row-label">{it.label}</div>
            <div className="row-bar">
              <div
                className="row-fill"
                style={{ width: `${(it.value / max) * 100}%`, background: it.color }}
                title={`${it.label}: ${it.value}${it.unit}`}
              />
            </div>
            <div className="row-value">{it.value}{it.unit}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
