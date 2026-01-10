"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart, ComposedChart } from 'recharts'

export default function Home() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    adjustment: 0
  })
  const [message, setMessage] = useState('')
  const [workLogs, setWorkLogs] = useState([])
  const [timePeriod, setTimePeriod] = useState('L1M')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkLogs()
  }, [])

  const fetchWorkLogs = async () => {
    const { data, error } = await supabase
      .from('Work_Logs')
      .select('*')
      .order('Date', { ascending: true })

    if (error) {
      console.error('Error fetching work logs:', error)
    } else {
      setWorkLogs(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const start = new Date(`${formData.date}T${formData.startTime}`)
    const end = new Date(`${formData.date}T${formData.endTime}`)
    const hoursWorked = (end - start) / (1000 * 60 * 60)
    const totalHours = hoursWorked + parseFloat(formData.adjustment || 0)

    const { data, error } = await supabase
      .from('Work_Logs')
      .insert([
        {
          Date: formData.date,
          'Start Time': formData.startTime,
          'End Time': formData.endTime,
          adjustment: parseFloat(formData.adjustment || 0),
          hours: totalHours
        }
      ])

    if (error) {
      setMessage(`Error: ${error.message}`)
      console.error(error)
    } else {
      setMessage('Work log saved!')
      setFormData({ 
        date: new Date().toISOString().split('T')[0], 
        startTime: '', 
        endTime: '', 
        adjustment: 0 
      })
      fetchWorkLogs()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const calculateRollingAverage = (logs, index) => {
    const startIndex = Math.max(0, index - 6)
    const relevantLogs = logs.slice(startIndex, index + 1)
    const totalHours = relevantLogs.reduce((sum, log) => sum + parseFloat(log.hours || 0), 0)
    return (totalHours / relevantLogs.length).toFixed(1)
  }

  const formatDateForPeriod = (dateString, period) => {
    const date = new Date(dateString)
    
    // For short periods (L7D, L1M), show day + month
    if (period === 'L7D' || period === 'L1M') {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    }
    
    // For longer periods, just show month
    return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
  }

  const getFilteredData = () => {
    if (workLogs.length === 0) return []

    const today = new Date()
    let startDate = new Date()

    switch(timePeriod) {
      case 'L7D':
        startDate.setDate(today.getDate() - 7)
        break
      case 'L1M':
        startDate.setDate(today.getDate() - 30)
        break
      case 'L3M':
        startDate.setMonth(today.getMonth() - 3)
        break
      case 'L6M':
        startDate.setMonth(today.getMonth() - 6)
        break
      case 'YTD':
        startDate = new Date(today.getFullYear(), 0, 1)
        break
      case 'LTM':
        startDate.setFullYear(today.getFullYear() - 1)
        break
      case 'ALL':
        startDate = new Date(0)
        break
    }

    const filteredLogs = workLogs.filter(log => new Date(log.Date) >= startDate)

    return filteredLogs.map((log, index) => {
      const rollingAvg = parseFloat(calculateRollingAverage(filteredLogs, index))
      const weeklyAvg = (rollingAvg * 7).toFixed(1)
      
      return {
        date: formatDateForPeriod(log.Date, timePeriod),
        hours: parseFloat(log.hours || 0).toFixed(1),
        rollingAvg: rollingAvg,
        weeklyAvg: weeklyAvg,
        fullDate: log.Date
      }
    })
  }

  const chartData = getFilteredData()

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Burnout IQ</h1>

      {/* Quick Input Form */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ marginTop: 0 }}>Log Today's Hours</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Start Time</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>End Time</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Adjustment (hrs)</label>
            <input
              type="number"
              step="0.5"
              value={formData.adjustment}
              onChange={(e) => setFormData({...formData, adjustment: e.target.value})}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '100px' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Log Hours
          </button>
        </form>
        {message && (
          <p style={{ 
            marginTop: '10px', 
            marginBottom: 0,
            color: message.includes('Error') ? '#dc2626' : '#16a34a',
            fontWeight: 'bold'
          }}>
            {message}
          </p>
        )}
      </div>

      {/* Time Period Selector */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['L7D', 'L1M', 'L3M', 'L6M', 'YTD', 'LTM', 'ALL'].map(period => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              style={{
                padding: '8px 16px',
                backgroundColor: timePeriod === period ? '#2563eb' : '#e5e7eb',
                color: timePeriod === period ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: timePeriod === period ? 'bold' : 'normal'
              }}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart with Daily Hours, Rolling Average, and Weekly Average */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ marginTop: 0 }}>Work Hours - {timePeriod}</h2>
        {loading ? (
          <p>Loading data...</p>
        ) : chartData.length === 0 ? (
          <p>No data available for this period. Start logging your hours!</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={timePeriod === 'L7D' || timePeriod === 'L1M' ? -45 : 0}
                textAnchor={timePeriod === 'L7D' || timePeriod === 'L1M' ? 'end' : 'middle'}
                height={timePeriod === 'L7D' || timePeriod === 'L1M' ? 80 : 60}
              />
              <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#2563eb" name="Daily Hours" />
              <Line 
                type="monotone" 
                dataKey="rollingAvg" 
                stroke="#dc2626" 
                strokeWidth={2}
                name="7-Day Rolling Avg (Daily)" 
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="weeklyAvg" 
                stroke="#16a34a" 
                strokeWidth={2}
                name="Implied Weekly Avg" 
                dot={false}
                strokeDasharray="5 5"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick Link to Dashboard */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a 
          href="/dashboard" 
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#16a34a', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}
        >
          View Full Dashboard →
        </a>
      </div>
    </div>
  )
}