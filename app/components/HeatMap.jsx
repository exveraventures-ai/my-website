"use client"

import { useState, useMemo } from 'react'

export default function HeatMap({ workLogs, heatmapData: providedData, isPro = true }) {
  const [hoveredCell, setHoveredCell] = useState(null)

  // Aggregate hours by weekday-hour buckets (L180D)
  // If providedData is passed, use it; otherwise calculate from workLogs
  const calculatedData = useMemo(() => {
    if (!workLogs || workLogs.length === 0) return null

    const today = new Date()
    const oneEightyDaysAgo = new Date(today)
    oneEightyDaysAgo.setDate(today.getDate() - 180)

    // Filter completed entries within L180D
    const completedLogs = workLogs.filter(log => {
      if (!log['Start Time'] || !log['End Time']) return false
      const logDate = new Date(log.Date)
      return logDate >= oneEightyDaysAgo && logDate <= today
    })

    if (completedLogs.length === 0) return null

    // Initialize buckets: [dayOfWeek][hour] = { totalHours, count, worst }
    // JavaScript Date.getDay() returns: 0=Sunday, 1=Monday, ..., 6=Saturday
    const buckets = {}
    const dayNamesByIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayNamesOrdered = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] // Display order
    
    // Initialize all days
    dayNamesByIndex.forEach(day => {
      buckets[day] = {}
      for (let h = 0; h < 24; h++) {
        buckets[day][h] = { totalHours: 0, count: 0, worst: 0, dates: [] }
      }
    })

    // Aggregate data - for each day-hour, find logs where work spans that hour
    completedLogs.forEach(log => {
      const logDate = new Date(log.Date)
      const dayOfWeek = dayNamesByIndex[logDate.getDay()] // Convert JavaScript day index to day name
      const hours = parseFloat(log.hours || 0)
      
      if (hours === 0) return

      const [startHour, startMin] = log['Start Time'].split(':').map(Number)
      const [endHour, endMin] = log['End Time'].split(':').map(Number)
      
      let startMinutes = startHour * 60 + startMin
      let endMinutes = endHour * 60 + endMin
      
      // Handle overnight shifts
      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60
      }

      // For each hour bucket, check if this work period spans it
      for (let hour = 0; hour < 24; hour++) {
        const hourStartMinutes = hour * 60
        const hourEndMinutes = (hour + 1) * 60
        
        // Check if this hour overlaps with work period
        // Handle wrap-around for overnight shifts
        let overlaps = false
        if (endMinutes <= 24 * 60) {
          // Normal same-day shift
          overlaps = startMinutes < hourEndMinutes && endMinutes > hourStartMinutes
        } else {
          // Overnight shift
          overlaps = startMinutes < hourEndMinutes || (endMinutes % (24 * 60)) > hourStartMinutes
        }
        
        if (overlaps) {
          // Calculate how much of this hour is covered
          let overlapStart = Math.max(startMinutes % (24 * 60), hourStartMinutes)
          let overlapEnd = Math.min(endMinutes % (24 * 60) || (24 * 60), hourEndMinutes)
          
          if (overlapStart < overlapEnd) {
            const overlapMinutes = overlapEnd - overlapStart
            const overlapHours = overlapMinutes / 60
            
            // For the heatmap, we want to show the average hours worked on days that include this hour
            // So we add the total daily hours (not just the hour portion) to show intensity
            buckets[dayOfWeek][hour].totalHours += hours // Use total daily hours for intensity
            buckets[dayOfWeek][hour].count++
            buckets[dayOfWeek][hour].worst = Math.max(buckets[dayOfWeek][hour].worst, hours)
            buckets[dayOfWeek][hour].dates.push(log.Date)
          }
        }
      }
    })

    // Calculate averages and prepare data in Monday-first order
    // For each day-hour, average hours = total hours / unique days
    const result = dayNamesOrdered.map(day => {
      return Array.from({ length: 24 }, (_, hour) => {
        const bucket = buckets[day]?.[hour] || { totalHours: 0, count: 0, worst: 0, dates: [] }
        const uniqueDays = new Set(bucket.dates).size
        // Average hours worked on days that include this hour
        const avgHours = uniqueDays > 0 ? bucket.totalHours / uniqueDays : 0
        
        return {
          day,
          hour,
          avgHours: avgHours.toFixed(1),
          count: bucket.count,
          worst: bucket.worst.toFixed(1),
          uniqueDays,
          displayHour: `${hour.toString().padStart(2, '0')}:00`
        }
      })
    })

    return result
  }, [workLogs])

  // Use provided data if available, otherwise use calculated
  const heatmapData = providedData || calculatedData

  // Calculate top 5 worst cells
  const worstCells = useMemo(() => {
    if (!heatmapData) return []
    
    const allCells = []
    heatmapData.forEach((dayRow, dayIdx) => {
      dayRow.forEach((cell, hourIdx) => {
        if (parseFloat(cell.avgHours) > 0) {
          allCells.push({
            ...cell,
            dayIdx,
            hourIdx
          })
        }
      })
    })

    return allCells
      .sort((a, b) => parseFloat(b.avgHours) - parseFloat(a.avgHours))
      .slice(0, 5)
  }, [heatmapData])

  // Calculate finance flags
  const financeFlags = useMemo(() => {
    if (!heatmapData) return { redEyeRisk: false, weekendCreep: false }

    let redEyeHours = 0
    let redEyeCount = 0
    let saturdayMax = 0
    let sundayMax = 0

    heatmapData.forEach(dayRow => {
      dayRow.forEach(cell => {
        const avg = parseFloat(cell.avgHours)
        const hour = cell.hour
        
        // Red-eye risk: 02-05h - average hours worked during these hours
        // This represents average total daily hours on days with work in 02-05h window
        if (hour >= 2 && hour <= 5 && avg > 0) {
          redEyeHours += avg
          redEyeCount++
        }
        
        // Weekend creep: Sat/Sun - find max intensity (peak hourly average)
        // This represents average total daily hours on weekends with work at that hour
        // If max >4h, it means weekends have significant work when they occur
        if (cell.day === 'Saturday' && avg > 0) {
          saturdayMax = Math.max(saturdayMax, avg)
        }
        if (cell.day === 'Sunday' && avg > 0) {
          sundayMax = Math.max(sundayMax, avg)
        }
      })
    })

    const redEyeAvg = redEyeCount > 0 ? redEyeHours / redEyeCount : 0

    return {
      redEyeRisk: redEyeAvg > 2,
      weekendCreep: saturdayMax > 4 || sundayMax > 4,
      redEyeAvg: redEyeAvg.toFixed(1),
      saturdayTotal: saturdayMax.toFixed(1),
      sundayTotal: sundayMax.toFixed(1)
    }
  }, [heatmapData])

  // Get color for cell based on average hours
  const getCellColor = (avgHours) => {
    const hours = parseFloat(avgHours || 0)
    if (hours === 0) return '#f5f5f7'
    if (hours < 6) return '#34C759' // Green
    if (hours < 9) return '#FFD700' // Yellow
    if (hours < 12) return '#FF9500' // Orange
    return '#FF3B30' // Red
  }

  // Get border color for worst cells
  const isWorstCell = (day, hour) => {
    return worstCells.some(cell => cell.day === day && cell.hour === hour)
  }

  if (!isPro) {
    return (
      <div style={{
        backgroundColor: '#f5f5f7',
        padding: '60px 40px',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
        <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1d1d1f', marginBottom: '12px' }}>
          Pro Feature
        </h3>
        <p style={{ fontSize: '16px', color: '#6e6e73', marginBottom: '24px' }}>
          Unlock the Work Hours Heatmap to visualize your work patterns across days and hours.
        </p>
        <a href="/upgrade" style={{
          padding: '12px 24px',
          backgroundColor: '#4F46E5',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          Upgrade to Pro - £1.99/month
        </a>
      </div>
    )
  }

  if (!heatmapData) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: '#6e6e73'
      }}>
        <p style={{ fontSize: '17px' }}>No work hours data available. Start logging your hours to see the heatmap.</p>
      </div>
    )
  }

  const cellWidth = 30
  const cellHeight = 25
  const padding = 10
  const legendHeight = 60
  const width = 24 * cellWidth + padding * 2 + 120 // 120 for day labels
  const height = 7 * cellHeight + padding * 2 + legendHeight

  // Order days: Monday through Sunday
  const displayDayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  // Reorder heatmapData to match display order (Mon-Sun)
  const orderedHeatmapData = displayDayOrder.map(dayName => 
    heatmapData.find(dayRow => dayRow[0]?.day === dayName) || Array.from({ length: 24 }, (_, hour) => ({
      day: dayName,
      hour,
      avgHours: '0.0',
      count: 0,
      worst: '0.0',
      uniqueDays: 0,
      displayHour: `${hour.toString().padStart(2, '0')}:00`
    }))
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Finance Flags */}
      {(financeFlags.redEyeRisk || financeFlags.weekendCreep) && (
        <div style={{
          backgroundColor: '#FFF5F5',
          border: '2px solid #FF3B30',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#FF3B30', marginBottom: '8px' }}>
            🔴 Finance Risk Flags
          </div>
          {financeFlags.redEyeRisk && (
            <div style={{ fontSize: '14px', color: '#1d1d1f', marginBottom: '4px' }}>
              ⚠️ Red-eye risk: {financeFlags.redEyeAvg}h avg in 02-05h window. Sleep debt=1.5x errors.
            </div>
          )}
          {financeFlags.weekendCreep && (
            <div style={{ fontSize: '14px', color: '#1d1d1f' }}>
              ⚠️ Weekend creep: Sat {financeFlags.saturdayTotal}h, Sun {financeFlags.sundayTotal}h. >4h = recovery debt.
            </div>
          )}
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        overflowX: 'auto'
      }}>
        <svg width={width} height={height} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          {/* Day labels */}
          {displayDayOrder.map((dayName, dayIdx) => {
            const y = padding + dayIdx * cellHeight + cellHeight / 2
            return (
              <text
                key={dayName}
                x={padding + 100}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="500"
                fill="#6e6e73"
                style={{ pointerEvents: 'none' }}
              >
                {dayLabels[dayIdx]}
              </text>
            )
          })}

          {/* Hour labels (top) */}
          {Array.from({ length: 24 }, (_, hour) => {
            const x = padding + 120 + hour * cellWidth + cellWidth / 2
            return (
              <text
                key={hour}
                x={x}
                y={padding - 5}
                textAnchor="middle"
                fontSize="10"
                fill="#86868b"
                style={{ pointerEvents: 'none' }}
              >
                {hour.toString().padStart(2, '0')}
              </text>
            )
          })}

          {/* Heatmap cells */}
          {orderedHeatmapData.map((dayRow, dayIdx) => {
            return dayRow.map((cell, hourIdx) => {
              const x = padding + 120 + hourIdx * cellWidth
              const y = padding + dayIdx * cellHeight
              const isHovered = hoveredCell?.day === cell.day && hoveredCell?.hour === cell.hour
              const isWorst = isWorstCell(cell.day, cell.hour)
              
              return (
                <rect
                  key={`${cell.day}-${cell.hour}`}
                  x={x}
                  y={y}
                  width={cellWidth - 2}
                  height={cellHeight - 2}
                  fill={getCellColor(cell.avgHours)}
                  stroke={isWorst ? '#FF3B30' : isHovered ? '#007AFF' : '#ffffff'}
                  strokeWidth={isWorst ? 2 : isHovered ? 2 : 1}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setHoveredCell({ day: cell.day, hour: cell.hour, data: cell })}
                  onMouseLeave={() => setHoveredCell(null)}
                  opacity={parseFloat(cell.avgHours) === 0 ? 0.3 : 1}
                />
              )
            })
          })}

          {/* Tooltip */}
          {hoveredCell && hoveredCell.data && (
            <g>
              <rect
                x={padding + 120 + hoveredCell.hour * cellWidth - 70}
                y={padding + displayDayOrder.indexOf(hoveredCell.day) * cellHeight - 55}
                width="140"
                height="50"
                fill="rgba(0,0,0,0.9)"
                rx="6"
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={padding + 120 + hoveredCell.hour * cellWidth}
                y={padding + displayDayOrder.indexOf(hoveredCell.day) * cellHeight - 35}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#ffffff"
                style={{ pointerEvents: 'none' }}
              >
                {hoveredCell.day} {hoveredCell.hour.toString().padStart(2, '0')}:00
              </text>
              <text
                x={padding + 120 + hoveredCell.hour * cellWidth}
                y={padding + displayDayOrder.indexOf(hoveredCell.day) * cellHeight - 20}
                textAnchor="middle"
                fontSize="10"
                fill="#ffffff"
                style={{ pointerEvents: 'none' }}
              >
                {hoveredCell.data.avgHours}h avg (n={hoveredCell.data.uniqueDays} days)
              </text>
              <text
                x={padding + 120 + hoveredCell.hour * cellWidth}
                y={padding + displayDayOrder.indexOf(hoveredCell.day) * cellHeight - 5}
                textAnchor="middle"
                fontSize="10"
                fill="#ffffff"
                style={{ pointerEvents: 'none' }}
              >
                worst: {hoveredCell.data.worst}h
              </text>
            </g>
          )}

          {/* Legend */}
          <g transform={`translate(${padding + 120}, ${height - legendHeight + 20})`}>
            <text
              x={12 * cellWidth}
              y={0}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill="#1d1d1f"
              style={{ pointerEvents: 'none' }}
            >
              Average Hours
            </text>
            
            {/* Legend cells */}
            {[
              { label: '<6h', color: '#34C759', hours: 0 },
              { label: '6-9h', color: '#FFD700', hours: 7.5 },
              { label: '9-12h', color: '#FF9500', hours: 10.5 },
              { label: '>12h', color: '#FF3B30', hours: 13.5 }
            ].map((item, idx) => {
              const legendX = 8 * cellWidth + idx * 80
              return (
                <g key={idx}>
                  <rect
                    x={legendX}
                    y={15}
                    width={cellWidth - 2}
                    height={cellHeight - 2}
                    fill={item.color}
                    stroke="#ffffff"
                    strokeWidth={1}
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x={legendX + (cellWidth - 2) / 2}
                    y={15 + cellHeight + 12}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#6e6e73"
                    style={{ pointerEvents: 'none' }}
                  >
                    {item.label}
                  </text>
                </g>
              )
            })}

            {/* Top 5 worst indicator */}
            {worstCells.length > 0 && (
              <g transform={`translate(${8 * cellWidth + 320}, 15)`}>
                <rect
                  x={0}
                  y={0}
                  width={cellWidth - 2}
                  height={cellHeight - 2}
                  fill="transparent"
                  stroke="#FF3B30"
                  strokeWidth={2}
                  style={{ pointerEvents: 'none' }}
                />
                <text
                  x={(cellWidth - 2) / 2}
                  y={cellHeight + 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#FF3B30"
                  fontWeight="600"
                  style={{ pointerEvents: 'none' }}
                >
                  Top 5
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Mobile responsive note */}
      <p style={{
        fontSize: '12px',
        color: '#86868b',
        marginTop: '12px',
        textAlign: 'center'
      }}>
        Scroll horizontally on mobile devices to view full heatmap
      </p>
    </div>
  )
}
