import React from 'react'
import CalendarCard from '../ui/CalendarCard'
import LineChartCard from '../ui/LineChartCard'
import BarChartCard from '../ui/BarChartCard'
import PercentCard from '../ui/PercentCard'
import WeekLineChart from '../ui/WeekLineChart'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="grid">
        <CalendarCard />
        <LineChartCard />
        <BarChartCard />
        <PercentCard />
      </div>
  <WeekLineChart />
    </div>
  )
}
