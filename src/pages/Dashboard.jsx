import React from 'react'
import CurrentConditions from '../ui/CurrentConditions'
import AIInsight from '../ui/AIInsight'
import LineChartCard from '../ui/LineChartCard'
import BarChartCard from '../ui/BarChartCard'
import PercentCard from '../ui/PercentCard'
import WeekLineChart from '../ui/WeekLineChart'
import MiniMap from '../ui/MiniMap'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="grid">
        <CurrentConditions />
        <MiniMap key="dashboard-minimap" />
        <BarChartCard />
        <PercentCard />
      </div>
      <AIInsight />
      <div className="bottom-section">
        <WeekLineChart />
        <LineChartCard />
      </div>
    </div>
  )
}
