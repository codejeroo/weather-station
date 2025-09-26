import React from 'react'
import CalendarCard from '../ui/CalendarCard'
import LineChartCard from '../ui/LineChartCard'
import BarChartCard from '../ui/BarChartCard'
import PercentCard from '../ui/PercentCard'
import WeekLineChart from '../ui/WeekLineChart'
import MiniMap from '../ui/MiniMap'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="grid">
        <CalendarCard />
        <MiniMap key="dashboard-minimap" />
        <BarChartCard />
        <PercentCard />
      </div>
      <div className="bottom-section">
        <WeekLineChart />
        <LineChartCard />
      </div>
    </div>
  )
}
