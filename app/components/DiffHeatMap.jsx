"use client"

import { useState, useMemo } from 'react'

// Generate benchmark PE associate heatmap data (research-based L180D avg)
const generateBenchmarkHeatmap = () => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  return dayNames.map(day => {
    return Array.from({ length: 24 }, (_, hour) => {
      let avgHours = 0
      
      // Mon-Thu: Peak 09-18h (9h avg), tail 07-20h
      if (['Monday', 'Tuesday', 'Wednesday', 'Thursday'].includes(day)) {
        if (hour >= 9 && hour < 18) {
          avgHours = 9.0 // Peak hours
        } else if ((hour >= 7 && hour < 9) || (hour >= 18 && hour < 20)) {
          avgHours = 4.5 // Tail hours (half intensity)
        } else if (hour >= 20 && hour < 22) {
          avgHours = 2.0 // Late evening
        } else if (hour >= 22 || hour < 2) {
          avgHours = 0.5 // Very late/early
        } else if (hour >= 2 && hour < 5) {
          avgHours = 0.3 // Red-eye (minimal)
        }
      }
      // Fri: 09-16h (7h), weekend creep 20-22h (2h)
      else if (day === 'Friday') {
        if (hour >= 9 && hour < 16) {
          avgHours = 7.0 // Peak hours (shorter Friday)
        } else if (hour >= 16 && hour < 20) {
          avgHours = 3.0 // Afternoon tail
        } else if (hour >= 20 && hour < 22) {
          avgHours = 2.0 // Weekend creep
        } else {
          avgHours = 0.2
        }
      }
      // Sat/Sun: <2h ideal
      else if (day === 'Saturday' || day === 'Sunday') {
        if (hour >= 10 && hour < 14) {
          avgHours = 1.5 // Light weekend work
        } else if (hour >= 14 && hour < 18) {
          avgHours = 0.8
        } else {
          avgHours = 0.2
        }
      }
      
      return {
        day,
        hour,
        avgHours: avgHours.toFixed(1),
        count: 1,
        worst: avgHours.toFixed(1),
        uniqueDays: 180, // Simulated full L180D coverage
        displayHour: `${hour.toString().padStart(2, '0')}:00`
      }
    })
  })
}

export default function DiffHeatMap({ userHeatmapData, benchmarkData, isPro = true }) {
  const [hoveredCell, setHoveredCell] = useState(null)

  // Calculate diff heatmap (user - benchmark)
  const diffData = useMemo(() => {
    if (!userHeatmapData || !benchmarkData) return null

    return userHeatmapData.map((dayRow, dayIdx) => {
      return dayRow.map((userCell, hourIdx) => {
        const benchCell = benchmarkData[dayIdx]?.[hourIdx]
        const userHours = parseFloat(userCell.avgHours || 0)
        const benchHours = parseFloat(benchCell?.avgHours || 0)
        const diff = userHours - benchHours

        return {
          day: userCell.day,
          hour: userCell.hour,
          diff: diff.toFixed(1),
          userHours: userHours.toFixed(1),
          benchHours: benchHours.toFixed(1),
          displayHour: userCell.displayHour
        }
      })
    })
  }, [userHeatmapData, benchmarkData])

  // Calculate worst deviations
  const worstDeviations = useMemo(() => {
    if (!diffData) return []
    
    const allCells = []
    diffData.forEach((dayRow) => {
      dayRow.forEach((cell) => {
        const diff = parseFloat(cell.diff)
        if (diff !== 0) {
          allCells.push(cell)
        }
      })
    })

    // Get top 5 worst (both over and under)
    const sortedByAbs = [...allCells].sort((a, b) => Math.abs(parseFloat(b.diff)) - Math.abs(parseFloat(a.diff)))
    return sortedByAbs.slice(0, 5)
  }, [diffData])

  // Calculate weekend and late-night alerts
  const alerts = useMemo(() => {
    if (!diffData) return { weekendRed: false, lateNightSpike: false, details: [] }
    
    let weekendOver = 0
    let lateNightOver = 0
    const details = []

    diffData.forEach(dayRow => {
      dayRow.forEach(cell => {
        const diff = parseFloat(cell.diff)
        
        // Weekend red: Sat/Sun > benchmark
        if ((cell.day === 'Saturday' || cell.day === 'Sunday') && diff > 0 && parseFloat(cell.userHours) > 4) {
          weekendOver += diff
        }
        
        // Late-night spikes: 22-05h > benchmark significantly
        if ((cell.hour >= 22 || cell.hour < 5) && diff > 2) {
          lateNightOver += diff
        }
      })
    })

    if (weekendOver > 0) {
      details.push(`Weekend red: ${weekendOver.toFixed(1)}h over benchmark on weekends`)
    }
    if (lateNightOver > 0) {
      details.push(`Late-night spike: ${lateNightOver.toFixed(1)}h over benchmark (22h-05h)`)
    }

    return {
      weekendRed: weekendOver > 4,
      lateNightSpike: lateNightOver > 2,
      details
    }
  }, [diffData])

  // Get color for diff cell (blue=under, red=over, gray=neutral)
  const getDiffColor = (diff) => {
    const diffVal = parseFloat(diff || 0)
    if (diffVal === 0) return '#f5f5f7'
    if (diffVal < -3) return '#007AFF' // Strongly under (blue)
    if (diffVal < -1) return '#4A90E2' // Moderately under (light blue)
    if (diffVal < 0) return '#87CEEB' // Slightly under (very light blue)
    if (diffVal < 1) return '#FFE5B4' // Slightly over (light yellow)
    if (diffVal < 3) return '#FF9500' // Moderately over (orange)
    return '#FF3B30' // Strongly over (red)
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
          Unlock the Difference Heatmap to compare your work patterns against PE benchmark.
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

  if (!diffData) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: '#6e6e73'
      }}>
        <p style={{ fontSize: '17px' }}>Calculating differences...</p>
      </div>
    )
  }

  const cellWidth = 30
  const cellHeight = 25
  const padding = 10
  const legendHeight = 80
  const width = 24 * cellWidth + padding * 2 + 120
  const height = 7 * cellHeight + padding * 2 + legendHeight

  const displayDayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div>
      {/* Alerts */}
      {alerts.details.length > 0 && (
        <div style={{
          backgroundColor: '#FFF5F5',
          border: '2px solid #FF3B30',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#FF3B30', marginBottom: '8px' }}>
            🔴 Deviation Alerts
          </div>
          {alerts.details.map((detail, idx) => (
            <div key={idx} style={{ fontSize: '14px', color: '#1d1d1f', marginBottom: '4px' }}>
              ⚠️ {detail}
            </div>
          ))}
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

          {/* Hour labels */}
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

          {/* Diff cells */}
          {diffData.map((dayRow, dayIdx) => {
            return dayRow.map((cell, hourIdx) => {
              const x = padding + 120 + hourIdx * cellWidth
              const y = padding + dayIdx * cellHeight
              const isHovered = hoveredCell?.day === cell.day && hoveredCell?.hour === cell.hour
              const diffVal = parseFloat(cell.diff)
              const isWorst = worstDeviations.some(w => w.day === cell.day && w.hour === cell.hour)
              
              return (
                <rect
                  key={`${cell.day}-${cell.hour}`}
                  x={x}
                  y={y}
                  width={cellWidth - 2}
                  height={cellHeight - 2}
                  fill={getDiffColor(cell.diff)}
                  stroke={isWorst ? '#FF3B30' : isHovered ? '#007AFF' : '#ffffff'}
                  strokeWidth={isWorst ? 2 : isHovered ? 2 : 1}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setHoveredCell({ day: cell.day, hour: cell.hour, data: cell })}
                  onMouseLeave={() => setHoveredCell(null)}
                  opacity={diffVal === 0 ? 0.3 : 1}
                />
              )
            })
          })}

          {/* Tooltip */}
          {hoveredCell && hoveredCell.data && (
            <g>
              <rect
                x={padding + 120 + hoveredCell.hour * cellWidth - 80}
                y={padding + displayDayOrder.indexOf(hoveredCell.day) * cellHeight - 60}
                width="160"
                height="55"
                fill="rgba(0,0,0,0.9)"
                rx="6"
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={padding + 120 + hoveredCell.hour * cellWidth}
                y={padding + displayDayOrder.indexOf(hoveredCell.day) * cellHeight - 40}
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
                y={padding + displayDayOrder.indexOf(hoveredCell.day) * cellHeight - 25}
                textAnchor="middle"
                fontSize="10"
                fill="#ffffff"
                style={{ pointerEvents: 'none' }}
              >
                You: {hoveredCell.data.userHours}h vs Benchmark: {hoveredCell.data.benchHours}h
              </text>
              <text
                x={padding + 120 + hoveredCell.hour * cellWidth}
                y={padding + displayDayOrder.indexOf(hoveredCell.day) * cellHeight - 10}
                textAnchor="middle"
                fontSize="10"
                fill={parseFloat(hoveredCell.data.diff) > 0 ? '#FF9500' : '#4A90E2'}
                fontWeight="600"
                style={{ pointerEvents: 'none' }}
              >
                {parseFloat(hoveredCell.data.diff) > 0 ? '+' : ''}{hoveredCell.data.diff}h {parseFloat(hoveredCell.data.diff) > 0 ? 'over' : 'under'}
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
              Difference (Your Hours - Benchmark)
            </text>
            
            {/* Legend cells */}
            {[
              { label: '<-3h under', color: '#007AFF', diff: -3 },
              { label: '-1 to -3h', color: '#4A90E2', diff: -2 },
              { label: '±1h', color: '#f5f5f7', diff: 0 },
              { label: '+1 to +3h', color: '#FF9500', diff: 2 },
              { label: '>+3h over', color: '#FF3B30', diff: 3 }
            ].map((item, idx) => {
              const legendX = 6 * cellWidth + idx * 90
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
                    fontSize="10"
                    fill="#6e6e73"
                    style={{ pointerEvents: 'none' }}
                  >
                    {item.label}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* Worst Deviation Metrics */}
      {worstDeviations.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '16px 20px',
          backgroundColor: '#f5f5f7',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f', marginBottom: '12px' }}>
            Worst Deviations from Benchmark
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {worstDeviations.slice(0, 5).map((cell, idx) => {
              const diff = parseFloat(cell.diff)
              const dayLabel = dayLabels[displayDayOrder.indexOf(cell.day)]
              return (
                <div key={idx} style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: `2px solid ${diff > 0 ? '#FF3B30' : '#007AFF'}`
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px' }}>
                    {dayLabel} {cell.hour.toString().padStart(2, '0')}:00
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: diff > 0 ? '#FF3B30' : '#007AFF' }}>
                    {diff > 0 ? '+' : ''}{diff}h {diff > 0 ? 'over' : 'under'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6e6e73', marginTop: '4px' }}>
                    You: {cell.userHours}h vs Bench: {cell.benchHours}h
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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

// Export benchmark generator for use in comparison page
export { generateBenchmarkHeatmap }
