import React from 'react'

function buildMonth(year, month) {
  // month is 0-based
  const first = new Date(year, month, 1)
  const startDay = first.getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  // leading blanks
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export default function CalendarCard() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const weeks = buildMonth(year, month)
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  return (
    <section className="card calendar-card">
      <h2>Calendar</h2>
      <div className="calendar-grid">
        <div className="calendar-header">
          <div className="month">{now.toLocaleString(undefined, { month: 'long' })} {year}</div>
          <div className="today-small">{now.toLocaleDateString()}</div>
        </div>

        <div className="weekdays">
          {dayNames.map(d => <div key={d} className="weekday">{d}</div>)}
        </div>

        <div className="weeks">
          {weeks.map((week, wi) => (
            <div key={wi} className="week">
              {week.map((cell, ci) => {
                const isToday = cell && cell.toDateString() === now.toDateString()
                return (
                  <div key={ci} className={`day ${isToday ? 'today' : ''}`}>
                    {cell ? cell.getDate() : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
