"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Footer from '../components/Footer'

// ============================================================================
// STYLE DEFINITIONS - MUST BE BEFORE COMPONENT
// ============================================================================
const navLinkStyle = {
  color: '#1d1d1f',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'opacity 0.2s'
}

const labelStyle = {
  fontSize: '13px', 
  display: 'block', 
  marginBottom: '8px',
  color: '#6e6e73',
  fontWeight: '500'
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px', 
  borderRadius: '10px', 
  border: '1px solid #d2d2d7',
  fontSize: '16px',
  fontFamily: 'inherit',
  outline: 'none'
}

const buttonStyle = {
  flex: '1 1 140px',
  padding: '12px 28px', 
  backgroundColor: '#4F46E5', 
  color: 'white', 
  border: 'none', 
  borderRadius: '10px', 
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '16px',
  fontFamily: 'inherit',
  transition: 'background-color 0.2s',
  boxShadow: '0 2px 8px rgba(79,70,229,0.3)'
}

const tableHeaderStyle = {
  textAlign: 'left',
  padding: '16px 12px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#1d1d1f',
  textTransform: 'uppercase',
  letterSpacing: '0.06em'
}

const tableCellStyle = {
  padding: '16px 12px',
  fontSize: '15px',
  color: '#1d1d1f'
}

const tableInputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid #d2d2d7',
  fontSize: '14px',
  fontFamily: 'inherit'
}

const editButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#4F46E5',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
  marginRight: '8px',
  fontFamily: 'inherit'
}

const deleteButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#FF3B30',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
  fontFamily: 'inherit'
}

const saveButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#34C759',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
  marginRight: '8px',
  fontFamily: 'inherit'
}

const cancelButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#6e6e73',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
  fontFamily: 'inherit'
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Hours() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:30',
    endTime: '21:30',
    adjustment: 0
  })
  const [message, setMessage] = useState('')
  const [workLogs, setWorkLogs] = useState([])
  const [timePeriod, setTimePeriod] = useState('L1M')
  const [loading, setLoading] = useState(true)
  const [editingLog, setEditingLog] = useState(null)
  const [editData, setEditData] = useState({})
  const [weeklyTarget, setWeeklyTarget] = useState(40)
  const [userPreferences, setUserPreferences] = useState(null)
  const [showAllEntries, setShowAllEntries] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [burnoutSectionCollapsed, setBurnoutSectionCollapsed] = useState(true)
  const [clockedIn, setClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState(null)
  const [partialEntry, setPartialEntry] = useState(null)

  useEffect(() => {
    document.title = 'Burnout IQ - Working Hours'
  }, [])

  useEffect(() => {
    checkUserAndFetch()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('burnoutiQ_user_id')
    router.push('/login')
  }

  const checkUserAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    let storedUserId = localStorage.getItem('burnoutiQ_user_id')

    if (!storedUserId) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (profile) {
        // Check if user is approved
        if (!profile.is_approved && !profile.is_admin) {
          await supabase.auth.signOut()
          router.push('/login?message=pending')
          return
        }
        
        localStorage.setItem('burnoutiQ_user_id', profile.id)
        storedUserId = profile.id
        setUserId(profile.id)
        setUserProfile(profile)
        setIsPro(profile.is_pro || false)
        
        // Load user preferences
        const prefs = {
          default_start_time: profile.default_start_time || '09:30',
          default_end_time: profile.default_end_time || '21:30',
          weekly_target_hours: profile.weekly_target_hours || 40
        }
        setUserPreferences(prefs)
        setWeeklyTarget(prefs.weekly_target_hours)
        
        // Update form data with user preferences
        setFormData(prev => ({
          ...prev,
          startTime: prefs.default_start_time,
          endTime: prefs.default_end_time
        }))
      } else {
        router.push('/profile')
        return
      }
    } else {
      setUserId(storedUserId)
    }

    // Load user profile and preferences (if not already loaded)
    if (!userProfile) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', storedUserId)
        .single()

      if (profile) {
        // Check if user is approved
        if (!profile.is_approved && !profile.is_admin) {
          await supabase.auth.signOut()
          router.push('/login?message=pending')
          return
        }
        
        setUserProfile(profile)
        setIsPro(profile.is_pro || false)
        
        // Load user preferences and update state
        const prefs = {
          default_start_time: profile.default_start_time || '09:30',
          default_end_time: profile.default_end_time || '21:30',
          weekly_target_hours: profile.weekly_target_hours || 40
        }
        setUserPreferences(prefs)
        setWeeklyTarget(prefs.weekly_target_hours)
        
        // Update form data with user preferences
        setFormData(prev => ({
          ...prev,
          startTime: prefs.default_start_time,
          endTime: prefs.default_end_time
        }))
      }
    }

    const { data: logs, error } = await supabase
      .from('Work_Logs')
      .select('*')
      .eq('user_id', storedUserId)
      .order('Date', { ascending: false })

    if (!error && logs) {
      setWorkLogs(logs)
      
      // Check for existing partial entry (clocked in but not clocked out) for today
      const today = new Date().toISOString().split('T')[0]
      const todayLog = logs.find(log => log.Date === today && log['Start Time'] && !log['End Time'])
      if (todayLog) {
        setClockedIn(true)
        setClockInTime(todayLog['Start Time'])
        setPartialEntry(todayLog)
      } else {
        setClockedIn(false)
        setClockInTime(null)
        setPartialEntry(null)
      }
    }

    setLoading(false)
  }

  const validateAndFormatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return '00:00'
    const parts = timeString.split(':')
    if (parts.length < 2) return '00:00'
    const hours = parts[0] || '0'
    const minutes = parts[1] || '0'
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }

  const calculateHours = (startTime, endTime, adjustment = 0) => {
    if (!startTime || !endTime) return 0

    try {
      const startParts = startTime.split(':')
      const endParts = endTime.split(':')
      
      if (startParts.length < 2 || endParts.length < 2) return 0
      
      const startHour = parseInt(startParts[0], 10) || 0
      const startMin = parseInt(startParts[1], 10) || 0
      const endHour = parseInt(endParts[0], 10) || 0
      const endMin = parseInt(endParts[1], 10) || 0

      let startMinutes = startHour * 60 + startMin
      let endMinutes = endHour * 60 + endMin

      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60
      }

      const totalMinutes = endMinutes - startMinutes
      const hoursWorked = totalMinutes / 60
      const totalHours = hoursWorked + parseFloat(adjustment || 0)

      return totalHours
    } catch (error) {
      console.error('Error calculating hours:', error)
      return 0
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const cleanStartTime = validateAndFormatTime(formData.startTime)
    const cleanEndTime = validateAndFormatTime(formData.endTime)

    const { data: existingEntry } = await supabase
      .from('Work_Logs')
      .select('*')
      .eq('user_id', userId)
      .eq('Date', formData.date)
      .single()

    if (existingEntry) {
      const confirmed = window.confirm(
        `An entry already exists for ${new Date(formData.date).toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })}. Do you want to overwrite it?`
      )

      if (!confirmed) {
        return
      }

      await supabase
        .from('Work_Logs')
        .delete()
        .eq('user_id', userId)
        .eq('Date', formData.date)
    }

    const totalHours = calculateHours(cleanStartTime, cleanEndTime, formData.adjustment)

    const { data, error } = await supabase
      .from('Work_Logs')
      .insert([
        {
          Date: formData.date,
          'Start Time': cleanStartTime,
          'End Time': cleanEndTime,
          adjustment: parseFloat(formData.adjustment || 0),
          hours: totalHours,
          user_id: userId
        }
      ])

    if (error) {
      setMessage(`Error: ${error.message}`)
      console.error(error)
    } else {
      setMessage('✓ Work log saved')
      // Reset form with user preferences
      const defaultStartTime = userPreferences?.default_start_time || '09:30'
      const defaultEndTime = userPreferences?.default_end_time || '21:30'
      setFormData({ 
        date: new Date().toISOString().split('T')[0], 
        startTime: defaultStartTime, 
        endTime: defaultEndTime, 
        adjustment: 0 
      })
      checkUserAndFetch()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleEdit = (log) => {
    setEditingLog({ user_id: log.user_id, date: log.Date })
    setEditData({
      date: log.Date,
      startTime: log['Start Time'],
      endTime: log['End Time'],
      adjustment: log.adjustment || 0
    })
  }

  const handleSaveEdit = async (user_id, originalDate) => {
    if (!editData.date || !editData.startTime || !editData.endTime) {
      setMessage('Error: Please fill in all required fields')
      return
    }
    
    const cleanStartTime = validateAndFormatTime(editData.startTime)
    const cleanEndTime = validateAndFormatTime(editData.endTime)

    const totalHours = calculateHours(cleanStartTime, cleanEndTime, editData.adjustment)

    if (editData.date !== originalDate) {
      await supabase
        .from('Work_Logs')
        .delete()
        .eq('user_id', user_id)
        .eq('Date', originalDate)

      const { error } = await supabase
        .from('Work_Logs')
        .insert([{
          Date: editData.date,
          'Start Time': cleanStartTime,
          'End Time': cleanEndTime,
          adjustment: parseFloat(editData.adjustment || 0),
          hours: totalHours,
          user_id: user_id
        }])

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('✓ Updated successfully')
        setEditingLog(null)
        checkUserAndFetch()
        setTimeout(() => setMessage(''), 3000)
      }
    } else {
      const { error } = await supabase
        .from('Work_Logs')
        .update({
          'Start Time': cleanStartTime,
          'End Time': cleanEndTime,
          adjustment: parseFloat(editData.adjustment || 0),
          hours: totalHours
        })
        .eq('user_id', user_id)
        .eq('Date', originalDate)

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('✓ Updated successfully')
        setEditingLog(null)
        checkUserAndFetch()
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingLog(null)
    setEditData({})
  }

  const handleDelete = async (user_id, date) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return

    const { error } = await supabase
      .from('Work_Logs')
      .delete()
      .eq('user_id', user_id)
      .eq('Date', date)

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('✓ Deleted successfully')
      checkUserAndFetch()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const calculateL7DTotal = (targetDate, allLogs) => {
    const currentDate = new Date(targetDate)
    const sevenDaysAgo = new Date(currentDate)
    sevenDaysAgo.setDate(currentDate.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    currentDate.setHours(23, 59, 59, 999)

    let total = 0
    allLogs.forEach(log => {
      // Only count completed entries (have both start and end time)
      if (!log['Start Time'] || !log['End Time']) return
      const logDate = new Date(log.Date)
      if (logDate >= sevenDaysAgo && logDate <= currentDate) {
        total += parseFloat(log.hours || 0)
      }
    })
    return total.toFixed(1)
  }

  // ============================================================================
  // 1. ROLLING 4-WEEK AVERAGE
  // ============================================================================
  const calculateRolling4WeekAverage = () => {
    if (workLogs.length === 0) {
      return {
        average: '0.0',
        status: 'No data',
        color: '#86868b',
        total: '0.0',
        recommendation: 'Start logging your hours to see your rolling 4-week average'
      }
    }
    
    const today = new Date()
    const fourWeeksAgo = new Date(today)
    fourWeeksAgo.setDate(today.getDate() - 28)
    
    // Generate array of all 28 days
    const all28Days = []
    for (let i = 0; i < 28; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      all28Days.push(date.toISOString().split('T')[0])
    }
    
    // Create map of logged days (only completed entries, missing days = 0)
    const loggedDaysMap = {}
    workLogs.forEach(log => {
      const logDate = new Date(log.Date)
      // Only count completed entries (have both start and end time)
      if (logDate >= fourWeeksAgo && logDate <= today && log['Start Time'] && log['End Time']) {
        loggedDaysMap[log.Date] = log.hours || 0
      }
    })
    
    // Calculate total: sum all 28 days (missing days = 0, partial entries = 0)
    const total = all28Days.reduce((sum, date) => sum + (loggedDaysMap[date] || 0), 0)
    // Convert to weekly average: total hours over 28 days = average hours per week
    const average = (total / 28) * 7 // Daily average * 7 days = weekly average
    
    let status = 'Healthy'
    let color = '#34C759'
    let recommendation = ''
    
    if (average > 80) {
      status = 'CRITICAL'
      color = '#FF3B30'
      recommendation = '⚠️ IMMEDIATE ACTION: Avg >80h/week. Cognitive error risk doubles. Schedule recovery post-closing.'
    } else if (average > 75) {
      status = 'Caution'
      color = '#FF9500'
      recommendation = '🟡 ALERT: Avg 75-80h/week. Unsustainable for >3 weeks. Plan recovery.'
    } else if (average > 60) {
      status = 'Active Diligence'
      color = '#007AFF'
      recommendation = '🔵 Sustainable for 2-3 weeks. Continue monitoring.'
    } else {
      status = 'Portfolio Mode'
      color = '#34C759'
      recommendation = '🟢 Healthy baseline. High capacity for additional work.'
    }
    
    return {
      average: average.toFixed(1),
      status,
      color,
      total: total.toFixed(1),
      recommendation
    }
  }

  // ============================================================================
  // 2. RED-EYE RATIO (Hours worked 10 PM - 6 AM)
  // ============================================================================
  const calculateRedEyeRatio = () => {
    if (workLogs.length === 0) return null
    
    let lateNightHours = 0
    let totalHours = 0
    let daysWithLateWork = 0
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(new Date().getDate() - 30)
    
    workLogs.forEach(log => {
      const logDate = new Date(log.Date)
      if (logDate < thirtyDaysAgo) return
      
      const startTime = log['Start Time']
      const endTime = log['End Time']
      const dailyHours = log.hours || 0
      
      if (!startTime || !endTime) return
      
      const [startHour, startMin] = startTime.split(':').map(Number)
      const [endHour, endMin] = endTime.split(':').map(Number)
      
      const startMins = startHour * 60 + startMin
      const endMins = endHour * 60 + endMin
      
      const lateNightStart = 1320
      const earlyMorning = 360
      
      if (endMins < startMins) {
        if (startMins >= lateNightStart) {
          lateNightHours += (1440 - startMins + endMins) / 60
          daysWithLateWork++
        } else if (endMins <= earlyMorning) {
          lateNightHours += endMins / 60
          daysWithLateWork++
        }
      } else {
        if (startMins < earlyMorning || endMins > lateNightStart) {
          const overlapStart = Math.max(startMins, lateNightStart)
          const overlapEnd = Math.min(endMins + 1440, earlyMorning + 1440)
          if (overlapStart < overlapEnd) {
            lateNightHours += (overlapEnd - overlapStart) / 60
            daysWithLateWork++
          }
        }
      }
      
      totalHours += dailyHours
    })
    
    const ratio = totalHours > 0 ? (lateNightHours / totalHours * 100).toFixed(1) : 0
    
    let status = 'Healthy'
    let color = '#34C759'
    let recommendation = ''
    
    if (ratio > 20) {
      status = 'CRITICAL'
      color = '#FF3B30'
      recommendation = '⚠️ >20% late-night work. Circadian disruption likely. Prioritize 10 PM - 6 AM boundary.'
    } else if (ratio > 15) {
      status = 'High'
      color = '#FF3B30'
      recommendation = '🔴 15-20% late-night. Biological cost: 2x day hours. Schedule recovery nights.'
    } else if (ratio > 10) {
      status = 'Moderate'
      color = '#FF9500'
      recommendation = '🟡 10-15% late-night. Monitor for creep. Protect sleep window.'
    } else {
      status = 'Healthy'
      color = '#34C759'
      recommendation = '🟢 <10% late-night. Circadian rhythm intact.'
    }
    
    return {
      ratio: ratio + '%',
      status,
      color,
      lateNightHours: lateNightHours.toFixed(1),
      daysWithLateWork,
      recommendation
    }
  }

  // ============================================================================
  // 3. PROTECTED WEEKEND BLOCKS
  // ============================================================================
  const calculateProtectedWeekends = () => {
    if (workLogs.length === 0) return null
    
    const today = new Date()
    const oneMonthAgo = new Date(today)
    oneMonthAgo.setDate(today.getDate() - 30)
    
    // Filter only completed entries (have both start and end time), then sort by date
    const completedLogs = workLogs.filter(log => log['Start Time'] && log['End Time'])
    const sortedLogs = [...completedLogs].sort((a, b) => new Date(a.Date) - new Date(b.Date))

    // Find longest recent break (consecutive days with <2h work)
    let currentBreakDays = 0
    let longestBreakDays = 0
    let daysSinceLastBreak = 0
    let foundRecentWork = false

    // Check last 60 days for breaks
    const sixtyDaysAgo = new Date(today)
    sixtyDaysAgo.setDate(today.getDate() - 60)

    const recentLogs = sortedLogs.filter(log => new Date(log.Date) >= sixtyDaysAgo)

    // Build a map of all dates in range
    const dateMap = new Map()
    for (let d = new Date(sixtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const log = recentLogs.find(l => l.Date === dateStr)
      const hours = log ? (log.hours || 0) : 0
      dateMap.set(dateStr, hours)
    }

    // Iterate through dates from most recent to find breaks
    const dates = Array.from(dateMap.keys()).sort().reverse()

    for (const dateStr of dates) {
      const hours = dateMap.get(dateStr)
      const isRecoveryDay = hours < 2

      if (isRecoveryDay) {
        currentBreakDays++
        longestBreakDays = Math.max(longestBreakDays, currentBreakDays)
      } else {
        if (!foundRecentWork) {
          daysSinceLastBreak = 0
          foundRecentWork = true
        }
        if (currentBreakDays > 0) {
          currentBreakDays = 0
        }
        if (foundRecentWork) {
          daysSinceLastBreak++
        }
      }
    }

    // Calculate weekend protection rate (last 30 days) - count ALL weekend days
    // Generate array of all weekend days in last 30 days
    const allWeekendDays = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        allWeekendDays.push(date.toISOString().split('T')[0])
      }
    }
    
    // Create map of logged weekend days (only completed entries)
    const loggedWeekendDays = {}
    workLogs.forEach(log => {
      const logDate = new Date(log.Date)
      // Only count completed entries (have both start and end time)
      if (logDate >= oneMonthAgo && logDate <= today && log['Start Time'] && log['End Time']) {
        loggedWeekendDays[log.Date] = parseFloat(log.hours || 0)
      }
    })
    
    // Count protected weekend days (days with 0 or <0.5 hours, or missing = 0 = protected)
    let protectedWeekendDays = 0
    allWeekendDays.forEach(date => {
      const hours = loggedWeekendDays[date] || 0
        if (hours === 0 || hours < 0.5) {
          protectedWeekendDays++
      }
    })
    
    const totalWeekendDays = allWeekendDays.length
    
    const protectionRate = totalWeekendDays > 0 
      ? ((protectedWeekendDays / totalWeekendDays) * 100).toFixed(0)
      : 0
    
    // Determine status with heavy weight on recent breaks
    let status, color, recommendation
    
    // If there was a 7+ day break in last 30 days, recovery is excellent
    if (longestBreakDays >= 7) {
      status = 'Recovered'
      color = '#34C759'
      recommendation = `🟢 Excellent: ${longestBreakDays}-day break detected. Recovery systems fully recharged. ${daysSinceLastBreak}d since break ended.`
    }
    // 4-6 day break = good recovery
    else if (longestBreakDays >= 4) {
      if (daysSinceLastBreak > 21) {
      status = 'Caution'
      color = '#FF9500'
        recommendation = `🟡 Last ${longestBreakDays}-day break was ${daysSinceLastBreak}d ago. Consider scheduling recovery soon.`
    } else {
        status = 'Good'
        color = '#34C759'
        recommendation = `🟢 ${longestBreakDays}-day break within last month. Good recovery baseline. ${daysSinceLastBreak}d since break.`
      }
    }
    // 2-3 day break = moderate
    else if (longestBreakDays >= 2) {
      if (daysSinceLastBreak > 14) {
        status = 'Elevated'
        color = '#FF9500'
        recommendation = `🟡 Only ${longestBreakDays}-day breaks. Last one ${daysSinceLastBreak}d ago. Schedule 4+ day break.`
      } else {
        status = 'Moderate'
        color = '#007AFF'
        recommendation = `🔵 ${longestBreakDays}-day break ${daysSinceLastBreak}d ago. Weekend protection: ${protectionRate}%.`
      }
    }
    // No meaningful breaks
    else {
      if (daysSinceLastBreak > 21 || protectionRate < 50) {
        status = 'Critical'
      color = '#FF3B30'
        recommendation = `🔴 ALERT: ${daysSinceLastBreak}+ days without recovery. Brain reset impossible. Schedule 4+ day break immediately.`
      } else {
        status = 'At Risk'
        color = '#FF9500'
        recommendation = `🟡 No extended breaks. Only ${protectionRate}% weekends protected. Schedule multi-day recovery.`
      }
    }
    
    return {
      protectionRate: protectionRate + '%',
      protectedWeekendDays,
      totalWeekendDays,
      status,
      color,
      recommendation,
      daysSinceLastBreak,
      longestRecentBreak: longestBreakDays
    }
  }

  // ============================================================================
  // COMBINED BURNOUT RISK SCORE
  // ============================================================================
  const calculateBurnoutRiskScore = () => {
    const r4w = calculateRolling4WeekAverage()
    const redEye = calculateRedEyeRatio()
    const weekends = calculateProtectedWeekends()
    
    if (!r4w || !redEye || !weekends) return null
    
    let riskScore = 0
    
    const avg = parseFloat(r4w.average)
    if (avg > 80) riskScore += 40
    else if (avg > 75) riskScore += 30
    else if (avg > 60) riskScore += 15
    else riskScore += 5
    
    const redEyeVal = parseFloat(redEye.ratio)
    if (redEyeVal > 20) riskScore += 35
    else if (redEyeVal > 15) riskScore += 25
    else if (redEyeVal > 10) riskScore += 15
    else riskScore += 5
    
    const daysNoBreak = weekends.daysSinceLastBreak || 0
    const longestBreak = weekends.longestRecentBreak || 0

    // Give massive credit for recent extended breaks
    if (longestBreak >= 7) {
      riskScore += 0  // 7+ day break = near-zero recovery risk
    } else if (longestBreak >= 4) {
      riskScore += Math.min(15, daysNoBreak * 0.5)  // 4-6 day break = low risk
    } else if (longestBreak >= 2) {
      riskScore += Math.min(20, daysNoBreak * 1)  // 2-3 day break = moderate risk
    } else if (daysNoBreak > 21) {
      riskScore += 25  // No breaks + 21+ days = critical
    } else if (daysNoBreak > 14) {
      riskScore += 20
    } else if (daysNoBreak > 7) {
      riskScore += 10
    } else {
      riskScore += 5
    }
    
    let overallStatus = 'Healthy'
    let overallColor = '#34C759'
    let urgency = ''
    
    if (riskScore >= 85) {
      overallStatus = 'CRITICAL BURNOUT RISK'
      overallColor = '#FF3B30'
      urgency = '🔴 IMMEDIATE: Combined metrics indicate high burnout risk. Take recovery action within 48 hours.'
    } else if (riskScore >= 65) {
      overallStatus = 'HIGH RISK'
      overallColor = '#FF3B30'
      urgency = '🔴 ALERT: Multiple burnout indicators. Schedule recovery. Avoid taking on additional commitments.'
    } else if (riskScore >= 40) {
      overallStatus = 'ELEVATED'
      overallColor = '#FF9500'
      urgency = '🟡 CAUTION: Burnout metrics elevated. Monitor closely. Plan recovery within 1-2 weeks.'
    } else if (riskScore >= 20) {
      overallStatus = 'MODERATE'
      overallColor = '#007AFF'
      urgency = '🔵 WATCH: Some elevation in metrics. Continue monitoring. Maintain recovery practices.'
    } else {
      overallStatus = 'SUSTAINABLE'
      overallColor = '#34C759'
      urgency = '🟢 GOOD: Metrics within healthy range. Maintain current rhythm.'
    }
    
    return {
      riskScore,
      overallStatus,
      overallColor,
      urgency,
      breakdown: {
        workloadScore: parseFloat(r4w.average),
        circadianScore: parseFloat(redEye.ratio),
        recoveryScore: daysNoBreak
      }
    }
  }

  // ============================================================================
  // LOAD INTENSITY INDEX (moved before usage)
  // ============================================================================
  const calculateLoadIntensityIndex = () => {
    if (workLogs.length === 0) return null

    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)
    const ninetyDaysAgo = new Date(today)
    ninetyDaysAgo.setDate(today.getDate() - 90)

    // Generate arrays of all days in periods
    const all7Days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      all7Days.push(date.toISOString().split('T')[0])
    }
    
    const all90Days = []
    for (let i = 0; i < 90; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      all90Days.push(date.toISOString().split('T')[0])
    }
    
    // Create maps of logged days (only completed entries, missing days = 0)
    const loggedDaysMap7 = {}
    const loggedDaysMap90 = {}
    workLogs.forEach(log => {
      // Only count completed entries (have both start and end time)
      if (!log['Start Time'] || !log['End Time']) return
      const logDate = new Date(log.Date)
      if (logDate >= sevenDaysAgo && logDate <= today) {
        loggedDaysMap7[log.Date] = log.hours || 0
      }
      if (logDate >= ninetyDaysAgo && logDate <= today) {
        loggedDaysMap90[log.Date] = log.hours || 0
      }
    })
    
    // Calculate averages: sum all days (missing = 0, partial = 0) / total days
    const total7 = all7Days.reduce((sum, date) => sum + (loggedDaysMap7[date] || 0), 0)
    const total90 = all90Days.reduce((sum, date) => sum + (loggedDaysMap90[date] || 0), 0)
    const h7 = total7 / 7 // Always divide by 7
    const h90 = total90 / 90 // Always divide by 90

    const intensityIndex = h90 > 0 ? ((h7 / h90) * 100).toFixed(1) : 0

    let status = 'Normal'
    let color = '#34C759'
    if (intensityIndex >= 130) {
      status = 'Very High'
      color = '#FF3B30'
    } else if (intensityIndex >= 115) {
      status = 'Elevated'
      color = '#FF9500'
    } else if (intensityIndex <= 85) {
      status = 'Light'
      color = '#007AFF'
    }

    return {
      intensityIndex,
      status,
      color,
      h7: h7.toFixed(1),
      h90: h90.toFixed(1)
    }
  }

  // ============================================================================
  // WEEKLY GOAL PACE (moved before usage)
  // ============================================================================
  const calculateWeeklyGoalPace = () => {
    if (workLogs.length === 0) return null

    const today = new Date()
    const startOfWeek = new Date(today)
    const dayOfWeek = startOfWeek.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startOfWeek.setDate(startOfWeek.getDate() - diff)
    startOfWeek.setHours(0, 0, 0, 0)

    // Filter only completed entries (have both start and end time)
    const currentWeekLogs = workLogs.filter(log => {
      if (!log['Start Time'] || !log['End Time']) return false
      const logDate = new Date(log.Date)
      return logDate >= startOfWeek && logDate <= today
    })

    const workedSoFar = currentWeekLogs.reduce((sum, log) => sum + (log.hours || 0), 0)

    const currentWeekday = dayOfWeek === 0 ? 5 : (dayOfWeek === 6 ? 5 : dayOfWeek)
    const expectedPace = (weeklyTarget / 5) * currentWeekday
    const delta = workedSoFar - expectedPace

    let paceStatus = 'On Track'
    let paceColor = '#34C759'
    if (delta < -5) {
      paceStatus = 'Behind'
      paceColor = '#FF3B30'
    } else if (delta > 5) {
      paceStatus = 'Ahead'
      paceColor = '#007AFF'
    }

    return {
      workedSoFar: workedSoFar.toFixed(1),
      expectedPace: expectedPace.toFixed(1),
      delta: delta.toFixed(1),
      weeklyTarget,
      paceStatus,
      paceColor,
      remaining: (weeklyTarget - workedSoFar).toFixed(1)
    }
  }

  const calculateWeeklyStatistics = () => {
    if (workLogs.length === 0) return null

    // Group logs by week ending Sunday (Sunday is day 0, so week runs Mon-Sun, ending on Sunday)
    const weeklyTotals = {}
    let worstL7D = 0

    workLogs.forEach(log => {
      const logDate = new Date(log.Date)
      logDate.setHours(0, 0, 0, 0)
      const dayOfWeek = logDate.getDay() // 0 = Sunday, 1 = Monday, etc.
      
      // Find the Sunday that ends this week
      // If it's Sunday, that's the end of the week
      // Otherwise, find the next Sunday
      const weekEndingSunday = new Date(logDate)
      if (dayOfWeek === 0) {
        // Already Sunday, this is the week end
        weekEndingSunday.setDate(logDate.getDate())
      } else {
        // Find the next Sunday
        const daysToSunday = 7 - dayOfWeek
        weekEndingSunday.setDate(logDate.getDate() + daysToSunday)
      }
      weekEndingSunday.setHours(23, 59, 59, 999)
      
      const weekKey = weekEndingSunday.toISOString().split('T')[0]
      
      if (!weeklyTotals[weekKey]) {
        weeklyTotals[weekKey] = 0
      }
      weeklyTotals[weekKey] += parseFloat(log.hours || 0)
    })

    // Count weeks over thresholds
    // Note: weeksOver90 includes weeks over 100, weeksOver80 includes both
    let weeksOver80 = 0
    let weeksOver90 = 0
    let weeksOver100 = 0

    Object.values(weeklyTotals).forEach(total => {
      if (total > 100) {
        weeksOver100++
        weeksOver90++
        weeksOver80++
      } else if (total > 90) {
        weeksOver90++
        weeksOver80++
      } else if (total > 80) {
        weeksOver80++
      }
    })

    // Calculate worst L7D (rolling 7-day total)
    const sortedLogs = [...workLogs].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
    
    sortedLogs.forEach((log, index) => {
      const currentDate = new Date(log.Date)
      const sevenDaysAgo = new Date(currentDate)
      sevenDaysAgo.setDate(currentDate.getDate() - 6)
      sevenDaysAgo.setHours(0, 0, 0, 0)
      currentDate.setHours(23, 59, 59, 999)

      let l7dTotal = 0
      for (let i = 0; i < sortedLogs.length; i++) {
        const logDate = new Date(sortedLogs[i].Date)
        if (logDate >= sevenDaysAgo && logDate <= currentDate) {
          l7dTotal += parseFloat(sortedLogs[i].hours || 0)
        }
      }
      
      if (l7dTotal > worstL7D) {
        worstL7D = l7dTotal
      }
    })

    return {
      weeksOver80,
      weeksOver90,
      weeksOver100,
      worstL7D: worstL7D.toFixed(1)
    }
  }

  const calculateAllMetrics = () => {
    if (workLogs.length === 0) {
      return {
        l7dTotal: '0',
        l7dAvgDaily: '0',
        allTimeAvgDaily: '0',
        currentStreak: 0,
        l1m: '0',
        l3m: '0',
        l6m: '0',
        ytd: '0',
        ltm: '0'
      }
    }

    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)

    // Filter only completed entries (have both start and end time)
    const completedLogs = workLogs.filter(log => log['Start Time'] && log['End Time'])
    
    // Generate array of all 7 days and create map of logged days
    const all7Days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      all7Days.push(date.toISOString().split('T')[0])
    }
    
    const loggedDaysMap = {}
    completedLogs.forEach(log => {
      const logDate = new Date(log.Date)
      if (logDate >= sevenDaysAgo && logDate <= today) {
        loggedDaysMap[log.Date] = log.hours || 0
      }
    })
    
    // Calculate total: sum all 7 days (missing days = 0, partial entries = 0)
    const l7dTotal = all7Days.reduce((sum, date) => sum + (loggedDaysMap[date] || 0), 0)
    const l7dAvgDaily = (l7dTotal / 7).toFixed(1) // Always divide by 7 days
    const l7dAvgWeekly = l7dTotal.toFixed(1)

    // For all-time average, calculate from first log date to today (missing days = 0)
    let allTimeAvgDaily = '0'
    if (completedLogs.length > 0) {
      const sortedLogs = [...completedLogs].sort((a, b) => new Date(a.Date) - new Date(b.Date))
      const firstDate = new Date(sortedLogs[0].Date)
      const daysSinceFirst = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24)) + 1
      const total = completedLogs.reduce((sum, log) => sum + (log.hours || 0), 0)
      allTimeAvgDaily = (total / daysSinceFirst).toFixed(1)
    }

    const calculatePeriod = (days) => {
      const periodStart = new Date(today)
      periodStart.setDate(today.getDate() - days)
      
      // Generate array of all days in period
      const allPeriodDays = []
      for (let i = 0; i < days; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        allPeriodDays.push(date.toISOString().split('T')[0])
      }
      
      // Create map of logged days (only completed entries)
      const loggedDaysMap = {}
      completedLogs.forEach(log => {
        const logDate = new Date(log.Date)
        // Only count completed entries (have both start and end time)
        if (logDate >= periodStart && log['Start Time'] && log['End Time']) {
          loggedDaysMap[log.Date] = log.hours || 0
        }
      })
      
      // Calculate total: sum all days (missing days = 0)
      const total = allPeriodDays.reduce((sum, date) => sum + (loggedDaysMap[date] || 0), 0)
      return (total / days * 7).toFixed(1) // Average per day * 7 for weekly projection
    }

    const sortedLogs = [...completedLogs].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
    let currentStreak = 0
    let expectedDate = new Date()

    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].Date)
      while (expectedDate.getDay() === 0 || expectedDate.getDay() === 6) {
        expectedDate.setDate(expectedDate.getDate() - 1)
      }
      if (logDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++
        expectedDate.setDate(expectedDate.getDate() - 1)
      } else {
        break
      }
    }

    return {
      l7dTotal: l7dAvgWeekly,
      l7dAvgDaily,
      allTimeAvgDaily,
      currentStreak,
      l1m: calculatePeriod(30),
      l3m: calculatePeriod(90),
      l6m: calculatePeriod(180),
      ytd: (() => {
        const yearStart = new Date(today.getFullYear(), 0, 1)
        const daysSinceYearStart = Math.floor((today - yearStart) / (1000 * 60 * 60 * 24)) + 1
        
        // Create map of logged days (only completed entries)
        const loggedDaysMap = {}
        completedLogs.forEach(log => {
          const logDate = new Date(log.Date)
          // Only count completed entries (have both start and end time)
          if (logDate >= yearStart && log['Start Time'] && log['End Time']) {
            loggedDaysMap[log.Date] = log.hours || 0
          }
        })
        
        // Calculate total from all days (missing = 0)
        let total = 0
        for (let i = 0; i < daysSinceYearStart; i++) {
          const date = new Date(yearStart)
          date.setDate(date.getDate() + i)
          const dateStr = date.toISOString().split('T')[0]
          total += loggedDaysMap[dateStr] || 0
        }
        
        return (total / daysSinceYearStart * 7).toFixed(1)
      })(),
      ltm: calculatePeriod(365)
    }
  }

  const formatDateForPeriod = (dateString, period) => {
    const date = new Date(dateString)
    if (period === 'L7D' || period === 'L1M') {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    }
    return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
  }

  const calculateWeeklyProjection = (currentWeekLogs, allLogs) => {
    if (currentWeekLogs.length === 0 || allLogs.length === 0) return null

    const dayOfWeekAverages = {}
    const dayOfWeekCounts = {}

    // Filter only completed entries for historical averages
    const completedAllLogs = allLogs.filter(log => log['Start Time'] && log['End Time'])
    
    completedAllLogs.forEach(log => {
      const date = new Date(log.Date)
      const dayOfWeek = date.getDay()

      if (dayOfWeek === 0 || dayOfWeek === 6) return

      if (!dayOfWeekAverages[dayOfWeek]) {
        dayOfWeekAverages[dayOfWeek] = 0
        dayOfWeekCounts[dayOfWeek] = 0
      }

      dayOfWeekAverages[dayOfWeek] += parseFloat(log.hours || 0)
      dayOfWeekCounts[dayOfWeek]++
    })

    Object.keys(dayOfWeekAverages).forEach(day => {
      dayOfWeekAverages[day] = dayOfWeekAverages[day] / dayOfWeekCounts[day]
    })

    let currentWeekTotal = 0
    let historicalExpectedSoFar = 0
    let latestDayOfWeek = 0

    // Filter only completed entries for current week
    const completedCurrentWeekLogs = currentWeekLogs.filter(log => log['Start Time'] && log['End Time'])
    
    completedCurrentWeekLogs.forEach(log => {
      const date = new Date(log.Date)
      const dayOfWeek = date.getDay()

      if (dayOfWeek === 0 || dayOfWeek === 6) return

      currentWeekTotal += parseFloat(log.hours || 0)
      historicalExpectedSoFar += dayOfWeekAverages[dayOfWeek] || 0
      latestDayOfWeek = Math.max(latestDayOfWeek, dayOfWeek)
    })

    const delta = historicalExpectedSoFar > 0 
      ? (currentWeekTotal - historicalExpectedSoFar) / currentWeekLogs.length 
      : 0

    let projectedRemaining = 0
    for (let day = latestDayOfWeek + 1; day <= 5; day++) {
      const historicalAvg = dayOfWeekAverages[day] || dayOfWeekAverages[1] || 10
      projectedRemaining += historicalAvg + delta
    }

    return currentWeekTotal + projectedRemaining
  }

  const getLoadIntensityChartData = () => {
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
      default:
        break
    }

    const filteredLogs = [...workLogs]
      .filter(log => new Date(log.Date) >= startDate)
      .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

    return filteredLogs.map((log, index) => {
      const currentDate = new Date(log.Date)

      const sevenDaysAgo = new Date(currentDate)
      sevenDaysAgo.setDate(currentDate.getDate() - 7)
      const last7 = filteredLogs.slice(0, index + 1).filter(l => 
        new Date(l.Date) >= sevenDaysAgo && new Date(l.Date) <= currentDate
      )
      const h7 = last7.length > 0 
        ? last7.reduce((sum, l) => sum + (l.hours || 0), 0) / last7.length
        : 0

      const ninetyDaysAgo = new Date(currentDate)
      ninetyDaysAgo.setDate(currentDate.getDate() - 90)
      const last90 = filteredLogs.slice(0, index + 1).filter(l => 
        new Date(l.Date) >= ninetyDaysAgo && new Date(l.Date) <= currentDate
      )
      const h90 = last90.length > 0
        ? last90.reduce((sum, l) => sum + (l.hours || 0), 0) / last90.length
        : 0

      const loadIndex = h90 > 0 ? parseFloat(((h7 / h90) * 100).toFixed(1)) : 100

      return {
        date: formatDateForPeriod(log.Date, timePeriod),
        loadIndex
      }
    })
  }

  const getWeeklyProgressChartData = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    const dayOfWeek = startOfWeek.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startOfWeek.setDate(startOfWeek.getDate() - diff)
    startOfWeek.setHours(0, 0, 0, 0)

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const dailyTarget = weeklyTarget / 5

    return dayNames.map((day, index) => {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + index)

      const log = workLogs.find(l => {
        const logDate = new Date(l.Date)
        return logDate.toDateString() === date.toDateString()
      })

      const actualHours = log ? parseFloat(log.hours || 0) : 0
      const isPast = date <= today

      return {
        day,
        actualHours: isPast ? actualHours : null,
        projectedHours: !isPast ? dailyTarget : null,
        target: dailyTarget
      }
    })
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
      default:
        break
    }

    const filteredLogs = [...workLogs]
      .filter(log => new Date(log.Date) >= startDate)
      .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

    // Sort all workLogs by date for L7D and weekly projection calculations
    const allLogsSorted = [...workLogs].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

    return filteredLogs.map((log, index) => {
      // Use all logs to calculate L7D, not just filtered logs
      const l7dTotal = parseFloat(calculateL7DTotal(log.Date, allLogsSorted))

      const logDate = new Date(log.Date)
      const startOfWeek = new Date(logDate)
      const dayOfWeek = startOfWeek.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      startOfWeek.setDate(startOfWeek.getDate() - diff)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      // Use all logs for weekly projection, not just filtered logs
      const currentWeekLogs = allLogsSorted.filter(l => {
        const d = new Date(l.Date)
        return d >= startOfWeek && d <= endOfWeek
      })

      const weeklyProjection = calculateWeeklyProjection(currentWeekLogs, workLogs)

      return {
        date: formatDateForPeriod(log.Date, timePeriod),
        hours: parseFloat(log.hours || 0).toFixed(1),
        l7dTotal: l7dTotal,
        weeklyProjection: weeklyProjection ? weeklyProjection.toFixed(1) : null,
        fullDate: log.Date
      }
    })
  }

  const getDayOfWeekData = () => {
    if (workLogs.length === 0) return []

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayTotals = {}
    const dayCounts = {}

    // Filter only completed entries (have both start and end time)
    workLogs.forEach(log => {
      if (!log['Start Time'] || !log['End Time']) return
      const date = new Date(log.Date)
      const dayOfWeek = date.getDay()
      const dayName = dayNames[dayOfWeek]

      if (!dayTotals[dayName]) {
        dayTotals[dayName] = 0
        dayCounts[dayName] = 0
      }

      dayTotals[dayName] += parseFloat(log.hours || 0)
      dayCounts[dayName]++
    })

    return dayNames.map(day => ({
      day: day.substring(0, 3),
      avgHours: dayCounts[day] > 0 ? parseFloat((dayTotals[day] / dayCounts[day]).toFixed(2)) : 0,
      totalDays: dayCounts[day] || 0
    }))
  }

  // Call all calculation functions with error handling
  let metrics, weeklyStats, loadIntensityIndex, weeklyGoalPace, r4w, redEye, weekends, burnout, chartData, dayOfWeekData, loadIntensityData, weeklyProgressData
  
  try {
    metrics = calculateAllMetrics()
    weeklyStats = calculateWeeklyStatistics()
    loadIntensityIndex = calculateLoadIntensityIndex()
    weeklyGoalPace = calculateWeeklyGoalPace()
    r4w = calculateRolling4WeekAverage()
    redEye = calculateRedEyeRatio()
    weekends = calculateProtectedWeekends()
    burnout = calculateBurnoutRiskScore()
    chartData = getFilteredData()
    dayOfWeekData = getDayOfWeekData()
    loadIntensityData = getLoadIntensityChartData()
    weeklyProgressData = getWeeklyProgressChartData()
  } catch (error) {
    console.error('Error calculating metrics:', error)
    // Set defaults to prevent crashes
    metrics = { l7dTotal: '0', l7dAvgDaily: '0', allTimeAvgDaily: '0', currentStreak: 0, l1m: '0', l3m: '0', l6m: '0', ytd: '0', ltm: '0' }
    chartData = []
    dayOfWeekData = []
    loadIntensityData = []
    weeklyProgressData = []
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#f5f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <p style={{ fontSize: '19px', color: '#6e6e73' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <nav style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '30px'
        }}>
          <a href="/dashboard" onClick={() => setShowProfileMenu(false)} style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1d1d1f',
            textDecoration: 'none',
            letterSpacing: '-0.02em'
          }}>
            Burnout <span style={{ color: '#06B6D4', fontWeight: '800' }}>IQ</span>
          </a>

          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="/dashboard" onClick={() => setShowProfileMenu(false)} style={navLinkStyle}>Dashboard</a>
            <a href="/hours" onClick={() => setShowProfileMenu(false)} style={{...navLinkStyle, fontWeight: '600', color: '#4F46E5'}}>Working Hours</a>
            <a href="/health" onClick={() => setShowProfileMenu(false)} style={navLinkStyle}>Health Stats</a>
            <a href="/compare" onClick={() => setShowProfileMenu(false)} style={navLinkStyle}>Comparisons</a>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isPro ? '#FFD700' : '#4F46E5',
                  color: isPro ? '#1d1d1f' : 'white',
                  border: 'none',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Profile
                {isPro && <span style={{ fontSize: '12px', fontWeight: '700' }}>✨</span>}
                <span style={{ fontSize: '12px' }}>▼</span>
              </button>

              {showProfileMenu && (
                <>
                  <div 
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 999
                    }}
                  />

                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    minWidth: '200px',
                    overflow: 'hidden',
                    zIndex: 1000
                  }}>
                    {userProfile && (
                      <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #e8e8ed'
                      }}>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px' }}>
                          {userProfile.email}
                        </div>
                        <div style={{ fontSize: '13px', color: '#86868b' }}>
                          {userProfile.position} · {userProfile.company}
                        </div>
                      </div>
                    )}

                    <a
                      href="/profile"
                      style={{
                        display: 'block',
                        padding: '14px 16px',
                        color: '#1d1d1f',
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      ⚙️ Edit Profile
                    </a>
                    <a
                      href="/settings"
                      style={{
                        display: 'block',
                        padding: '14px 16px',
                        color: '#1d1d1f',
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      ⚙️ Settings
                    </a>
                    {userProfile?.is_admin && (
                      <a
                        href="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        style={{
                          display: 'block',
                          padding: '14px 16px',
                          color: '#1d1d1f',
                          textDecoration: 'none',
                          fontSize: '15px',
                          fontWeight: '500',
                          transition: 'background-color 0.2s',
                          borderTop: '1px solid #e8e8ed'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        👑 Admin Panel
                      </a>
                    )}

                    <button
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        backgroundColor: 'transparent',
                        color: '#FF3B30',
                        border: 'none',
                        textAlign: 'left',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        borderTop: '1px solid #e8e8ed'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        padding: '60px 40px'
      }}>
        {/* Hero Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h1 style={{ 
            fontSize: '64px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            color: '#1d1d1f',
            letterSpacing: '-0.03em'
          }}>
            Working Hours
          </h1>
          <p style={{ 
            fontSize: '24px',
            color: '#6e6e73',
            fontWeight: '400',
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em'
          }}>
            Track your hours and maintain sustainable pace
          </p>
          {userProfile && (
            <p style={{
              fontSize: '17px',
              color: '#86868b',
              margin: 0
            }}>
              {userProfile.position} · {userProfile.company} · {userProfile.region}
            </p>
          )}
        </div>

        {/* Log Hours Form */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '16px',
          marginBottom: '50px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ 
              fontSize: '28px',
              fontWeight: '600',
              margin: 0,
              color: '#1d1d1f'
            }}>
              Log Hours
            </h2>
            <button
              type="button"
              onClick={() => {
                const entriesSection = document.getElementById('recent-entries')
                if (entriesSection) {
                  entriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6e6e73',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a5a5f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6e6e73'}
            >
              📝 View/Edit Entries
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label style={labelStyle}>Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
                step="60"
                style={inputStyle}
              />
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label style={labelStyle}>End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                required
                step="60"
                style={inputStyle}
              />
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label style={labelStyle}>Adjustment (hrs)</label>
              <input
                type="number"
                step="0.5"
                value={formData.adjustment}
                onChange={(e) => setFormData({...formData, adjustment: e.target.value})}
                style={inputStyle}
              />
            </div>

            <button type="submit" style={buttonStyle}>
              Log Hours
            </button>
          </form>
          {message && (
            <p style={{ 
              marginTop: '20px', 
              marginBottom: 0,
              color: message.includes('Error') ? '#FF3B30' : '#34C759',
              fontWeight: '500',
              fontSize: '15px'
            }}>
              {message}
            </p>
          )}
        </div>

        {/* BURNOUT RISK ASSESSMENT - NEW 4-METRIC FRAMEWORK */}
        <div style={{ 
          marginBottom: '50px',
          position: 'relative',
          backgroundColor: 'rgba(79,70,229,0.1)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(79,70,229,0.3)'
        }}>
          {/* Header with Collapse Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: burnoutSectionCollapsed ? '0' : '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              margin: '0',
              color: '#1d1d1f'
            }}>
              Burnout Risk Assessment
            </h2>
              {isPro && !burnoutSectionCollapsed && (
            <a href="/science" style={{
              padding: '8px 14px',
                  backgroundColor: '#4F46E5',
              color: 'white',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap'
                }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}>
              📚 See the Science
            </a>
              )}
            </div>
            <button
              onClick={() => setBurnoutSectionCollapsed(!burnoutSectionCollapsed)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#6e6e73',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s, color 0.2s',
                borderRadius: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#1d1d1f'
                e.currentTarget.style.backgroundColor = '#f5f5f7'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6e6e73'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {burnoutSectionCollapsed ? '▼' : '▲'}
            </button>
          </div>
          
          {!burnoutSectionCollapsed && (
            <>
              {!isPro ? (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '60px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: '300px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '600', 
                    color: '#1d1d1f', 
                    marginBottom: '12px',
                    lineHeight: '1.3'
                  }}>
                    Pro Feature
                  </h3>
                  <p style={{ 
                    fontSize: '16px', 
                    color: '#6e6e73', 
                    marginBottom: '24px', 
                    maxWidth: '450px',
                    lineHeight: '1.5'
                  }}>
                    Unlock comprehensive burnout risk assessment with detailed metrics and personalized recommendations.
                  </p>
                  <a 
                    href="/upgrade"
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#4F46E5',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
                  >
                    Upgrade to Pro - £1.99/month
                  </a>
                </div>
              ) : (
                <>
          {/* Overall Risk Score */}
          {burnout && (
            <div style={{ 
              backgroundColor: isPro ? burnout.overallColor : '#d2d2d7',
              color: 'white',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '30px',
              opacity: isPro ? 1 : 0.6
            }}>
              <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px', opacity: 0.9 }}>
                OVERALL BURNOUT RISK
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '12px' }}>
                {isPro ? `${burnout.riskScore}/100` : 'n.a.'}
              </div>
              <div style={{ fontSize: '17px', fontWeight: '500', marginBottom: '8px' }}>
                {isPro ? burnout.overallStatus : 'Pro feature'}
              </div>
              <div style={{ fontSize: '15px', lineHeight: '1.6' }}>
                {isPro ? burnout.urgency : 'Upgrade to Pro to see your burnout risk assessment'}
              </div>
            </div>
          )}
          
          {/* 4 Metric Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px'
          }}>
            {r4w && (
              <div style={{
                backgroundColor: isPro ? 'white' : '#f5f5f7',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: isPro ? '0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.03)',
                border: isPro ? `3px solid ${r4w.color}` : '3px solid #d2d2d7',
                opacity: isPro ? 1 : 0.6
              }}>
                <div style={{ fontSize: '13px', color: '#86868b', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Weekly Workload Average
                </div>
                <div style={{ fontSize: '40px', fontWeight: '700', color: isPro ? r4w.color : '#86868b', marginBottom: '4px' }}>
                  {isPro ? `${r4w.average}h` : 'n.a.'}
                </div>
                <div style={{ fontSize: '13px', color: '#6e6e73', marginBottom: '12px' }}>
                  {isPro ? `${r4w.status} • Total: ${r4w.total}h` : 'Pro feature'}
                </div>
                <div style={{ fontSize: '13px', color: '#1d1d1f', lineHeight: '1.6', padding: '12px', backgroundColor: isPro ? '#f5f5f7' : '#e8e8ed', borderRadius: '8px' }}>
                  {isPro ? r4w.recommendation : 'Upgrade to Pro to see your weekly workload analysis'}
                </div>
              </div>
            )}
            
            {redEye && (
              <div style={{
                backgroundColor: isPro ? 'white' : '#f5f5f7',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: isPro ? '0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.03)',
                border: isPro ? `3px solid ${redEye.color}` : '3px solid #d2d2d7',
                opacity: isPro ? 1 : 0.6
              }}>
                <div style={{ fontSize: '13px', color: '#86868b', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Circadian Disruption Index
                </div>
                <div style={{ fontSize: '40px', fontWeight: '700', color: isPro ? redEye.color : '#86868b', marginBottom: '4px' }}>
                  {isPro ? redEye.ratio : 'n.a.'}
                </div>
                <div style={{ fontSize: '13px', color: '#6e6e73', marginBottom: '12px' }}>
                  {isPro ? `${redEye.status} • ${redEye.lateNightHours}h late-night (${redEye.daysWithLateWork}d) • ` : ''}
                  {isPro && <a href="/science" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '500' }}>Learn more</a>}
                  {!isPro && 'Pro feature'}
                </div>
                <div style={{ fontSize: '13px', color: '#1d1d1f', lineHeight: '1.6', padding: '12px', backgroundColor: isPro ? '#f5f5f7' : '#e8e8ed', borderRadius: '8px' }}>
                  {isPro ? redEye.recommendation : 'Upgrade to Pro to see your circadian disruption analysis'}
                </div>
              </div>
            )}
            
             {/* Recovery Window Status Card - UPDATED */}
             {weekends && (
                <div style={{
                  backgroundColor: isPro ? 'white' : '#f5f5f7',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: isPro ? '0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.03)',
                  border: isPro ? `3px solid ${weekends.color}` : '3px solid #d2d2d7',
                  opacity: isPro ? 1 : 0.6
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#86868b',
                    fontWeight: '600',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    Recovery Window Status
                  </div>
                  <div style={{
                    fontSize: '40px',
                    fontWeight: '700',
                    color: isPro ? weekends.color : '#86868b',
                    marginBottom: '4px'
                  }}>
                    {isPro ? weekends.protectionRate : 'n.a.'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6e6e73', marginBottom: '12px' }}>
                    {isPro ? `${weekends.status} · ${weekends.protectedWeekendDays}/${weekends.totalWeekendDays} days protected ` : ''}
                    {isPro && <a href="/science" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '500' }}>Learn more</a>}
                    {!isPro && 'Pro feature'}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#1d1d1f',
                    lineHeight: '1.6',
                    padding: '12px',
                    backgroundColor: isPro ? '#f5f5f7' : '#e8e8ed',
                    borderRadius: '8px'
                  }}>
                    {isPro ? weekends.recommendation : 'Upgrade to Pro to see your recovery window status'}
                  </div>
                </div>
              )}
            
            {/* Sleep Debt Accumulation - Hidden for now */}
            {false && (
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '3px solid #86868b'
            }}>
              <div style={{ fontSize: '13px', color: '#86868b', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sleep Debt Accumulation
              </div>
              <div style={{ fontSize: '40px', fontWeight: '700', color: '#86868b', marginBottom: '4px' }}>
                N/A
              </div>
              <div style={{ fontSize: '13px', color: '#6e6e73', marginBottom: '12px' }}>
                Setup Required • Not yet configured
              </div>
              <div style={{ fontSize: '13px', color: '#1d1d1f', lineHeight: '1.6', padding: '12px', backgroundColor: '#f5f5f7', borderRadius: '8px' }}>
                ⚠️ Add sleep tracking to monitor recovery debt. Formula: (sleep needed - actual) - (recovery accumulated).
              </div>
            </div>
            )}
          </div>
                </>
              )}
          </>
          )}
        </div>


        {/* Key Statistics */}
        {metrics && (
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              margin: '0 0 24px 0',
              color: '#1d1d1f'
            }}>
              Key Statistics
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              <MetricCard 
                label="Current Streak" 
                value={metrics.currentStreak}
                sublabel="workdays tracked"
                color="#4F46E5"
                highlight
              />
              <MetricCard 
                label="L7D Total" 
                value={metrics.l7dTotal !== 'n.m.' ? metrics.l7dTotal + ' hrs' : '0 hrs'}
                sublabel="Last 7 days"
              />
              <MetricCard 
                label="L7D Daily Avg" 
                value={metrics.l7dAvgDaily !== 'n.m.' ? metrics.l7dAvgDaily + ' hrs' : '0 hrs'}
                sublabel="Per day"
              />
              <MetricCard 
                label="Historical Avg" 
                value={metrics.allTimeAvgDaily !== 'n.m.' ? metrics.allTimeAvgDaily + ' hrs' : '0 hrs'}
                sublabel="All-time daily"
              />
            {weeklyGoalPace && (
              <MetricCard 
                label="Weekly Progress" 
                value={weeklyGoalPace.workedSoFar + '/' + weeklyGoalPace.weeklyTarget + ' hrs'}
                sublabel={`${weeklyGoalPace.paceStatus} (${weeklyGoalPace.delta > 0 ? '+' : ''}${weeklyGoalPace.delta} hrs)`}
                color={weeklyGoalPace.paceColor}
                highlight
              />
            )}
          </div>
        </div>
        )}

        {/* Time Period Selector */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['L7D', 'L1M', 'L3M', 'L6M', 'YTD', 'LTM', 'ALL'].map(period => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: timePeriod === period ? '#007AFF' : 'white',
                  color: timePeriod === period ? 'white' : '#1d1d1f',
                  border: timePeriod === period ? 'none' : '1px solid #d2d2d7',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: timePeriod === period ? '600' : '500',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  boxShadow: timePeriod === period ? '0 2px 8px rgba(79,70,229,0.3)' : 'none'
                }}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Work Hours Trend Chart */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          marginBottom: '30px'
        }}>
          <h2 style={{ 
            fontSize: '28px',
            fontWeight: '600',
            margin: '0 0 30px 0',
            color: '#1d1d1f'
          }}>
            Work Hours Trend — {timePeriod}
          </h2>
          {chartData.length === 0 ? (
            <p style={{ color: '#6e6e73' }}>No data available for this period. Start logging your hours!</p>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  angle={timePeriod === 'L7D' || timePeriod === 'L1M' ? -45 : 0}
                  textAnchor={timePeriod === 'L7D' || timePeriod === 'L1M' ? 'end' : 'middle'}
                  height={timePeriod === 'L7D' || timePeriod === 'L1M' ? 80 : 60}
                  tick={{ fill: '#6e6e73', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  label={{ value: 'Daily Hours', angle: -90, position: 'insideLeft', fill: '#6e6e73' }}
                  tick={{ fill: '#6e6e73', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'L7D Total', angle: 90, position: 'insideRight', fill: '#6e6e73' }}
                  tick={{ fill: '#6e6e73', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.98)', 
                    border: '1px solid #d2d2d7',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="hours" fill="#4F46E5" name="Daily Hours" radius={[4, 4, 0, 0]} />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="l7dTotal" 
                  stroke="#FF3B30" 
                  strokeWidth={3}
                  name="L7D Total" 
                  dot={false}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="weeklyProjection" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  name="Weekly Projection" 
                  dot={false}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Rolling Averages (Weekly) */}
        {metrics && (
          <div style={{ marginBottom: '50px' }}>
          <h2 style={{ 
            fontSize: '28px',
            fontWeight: '600',
              margin: '0 0 24px 0',
            color: '#1d1d1f'
          }}>
              Rolling Averages (Weekly)
          </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              <MetricCard 
                label="L1M" 
                value={metrics.l1m !== 'n.m.' ? metrics.l1m + ' hrs' : 'n.m.'}
                sublabel="Last 1 month"
              />
              <MetricCard 
                label="L3M" 
                value={metrics.l3m !== 'n.m.' ? metrics.l3m + ' hrs' : 'n.m.'}
                sublabel="Last 3 months"
              />
              <MetricCard 
                label="L6M" 
                value={metrics.l6m !== 'n.m.' ? metrics.l6m + ' hrs' : 'n.m.'}
                sublabel="Last 6 months"
              />
              <MetricCard 
                label="YTD" 
                value={metrics.ytd !== 'n.m.' ? metrics.ytd + ' hrs' : 'n.m.'}
                sublabel="Year to date"
              />
              <MetricCard 
                label="LTM" 
                value={metrics.ltm !== 'n.m.' ? metrics.ltm + ' hrs' : 'n.m.'}
                sublabel="Last 12 months"
              />
            </div>

            {/* Weekly Statistics */}
            {weeklyStats && (
              <>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  margin: '40px 0 24px 0',
                  color: '#1d1d1f'
                }}>
                  Weekly Statistics
                </h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '20px'
                }}>
                  <MetricCard 
                    label="Weeks Over 80h" 
                    value={weeklyStats.weeksOver80}
                    sublabel="Total weeks"
                    color={weeklyStats.weeksOver80 > 0 ? '#FF9500' : '#34C759'}
                  />
                  <MetricCard 
                    label="Weeks Over 90h" 
                    value={weeklyStats.weeksOver90}
                    sublabel="Total weeks"
                    color={weeklyStats.weeksOver90 > 0 ? '#FF3B30' : '#34C759'}
                  />
                  <MetricCard 
                    label="Weeks Over 100h" 
                    value={weeklyStats.weeksOver100}
                    sublabel="Total weeks"
                    color={weeklyStats.weeksOver100 > 0 ? '#FF3B30' : '#34C759'}
                    highlight={weeklyStats.weeksOver100 > 0}
                  />
                  <MetricCard 
                    label="Worst L7D" 
                    value={weeklyStats.worstL7D + ' hrs'}
                    sublabel="Highest 7-day total"
                    color="#FF3B30"
                    highlight
                  />
                </div>
              </>
          )}
        </div>
        )}

        {/* Recent Entries Table */}
        <div id="recent-entries" style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '16px',
          marginBottom: '50px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '28px',
            fontWeight: '600',
              margin: 0,
            color: '#1d1d1f'
          }}>
            Recent Entries
          </h2>
            {!showAllEntries && workLogs.length > 0 && (() => {
              const today = new Date()
              const sevenDaysAgo = new Date(today)
              sevenDaysAgo.setDate(today.getDate() - 7)
              const last7DaysCount = workLogs.filter(log => {
                const logDate = new Date(log.Date)
                return logDate >= sevenDaysAgo
              }).length
              
              if (workLogs.length > last7DaysCount) {
                return (
                  <button
                    onClick={() => setShowAllEntries(true)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#4F46E5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '15px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
                  >
                    Show More ({workLogs.length - last7DaysCount} more entries)
                  </button>
                )
              }
              return null
            })()}
            {showAllEntries && (
              <button
                onClick={() => setShowAllEntries(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6e6e73',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a5a5f'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6e6e73'}
              >
                Show Less
              </button>
            )}
          </div>
          <div style={{ 
            overflowX: 'auto',
            maxHeight: showAllEntries ? '600px' : 'none',
            overflowY: showAllEntries ? 'auto' : 'visible'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: showAllEntries ? 'sticky' : 'static', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                <tr style={{ borderBottom: '2px solid #e8e8ed' }}>
                  <th style={tableHeaderStyle}>Date</th>
                  <th style={tableHeaderStyle}>Start Time</th>
                  <th style={tableHeaderStyle}>End Time</th>
                  <th style={tableHeaderStyle}>Adjustment</th>
                  <th style={tableHeaderStyle}>Total Hours</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let logsToShow = workLogs
                  
                  if (!showAllEntries) {
                    const today = new Date()
                    const sevenDaysAgo = new Date(today)
                    sevenDaysAgo.setDate(today.getDate() - 7)
                    sevenDaysAgo.setHours(0, 0, 0, 0)
                    
                    logsToShow = workLogs.filter(log => {
                      const logDate = new Date(log.Date)
                      logDate.setHours(0, 0, 0, 0)
                      return logDate >= sevenDaysAgo
                    })
                  }
                  
                  return logsToShow.map((log) => (
                  <tr key={`${log.user_id}-${log.Date}`} style={{ borderBottom: '1px solid #f5f5f7' }}>
                    {editingLog && editingLog.user_id === log.user_id && editingLog.date === log.Date ? (
                      <>
                        <td style={tableCellStyle}>
                          <input
                            type="date"
                            value={editData.date || ''}
                            onChange={(e) => setEditData({...editData, date: e.target.value})}
                            style={tableInputStyle}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            type="time"
                            value={editData.startTime || ''}
                            onChange={(e) => setEditData({...editData, startTime: e.target.value})}
                            step="60"
                            style={tableInputStyle}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            type="time"
                            value={editData.endTime || ''}
                            onChange={(e) => setEditData({...editData, endTime: e.target.value})}
                            step="60"
                            style={tableInputStyle}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            type="number"
                            step="0.5"
                            value={editData.adjustment || 0}
                            onChange={(e) => setEditData({...editData, adjustment: e.target.value})}
                            style={tableInputStyle}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          {calculateHours(editData.startTime || '00:00', editData.endTime || '00:00', editData.adjustment || 0).toFixed(2)} hrs
                        </td>
                        <td style={tableCellStyle}>
                          <button onClick={() => handleSaveEdit(log.user_id, log.Date)} style={saveButtonStyle}>
                            ✓ Save
                          </button>
                          <button onClick={handleCancelEdit} style={cancelButtonStyle}>
                            ✕ Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={tableCellStyle}>
                          {new Date(log.Date).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td style={tableCellStyle}>{log['Start Time'] || '-'}</td>
                        <td style={tableCellStyle}>{log['End Time'] || '-'}</td>
                        <td style={tableCellStyle}>{log.adjustment || 0} hrs</td>
                        <td style={tableCellStyle}>{parseFloat(log.hours || 0).toFixed(2)} hrs</td>
                        <td style={tableCellStyle}>
                          <button onClick={() => handleEdit(log)} style={editButtonStyle}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(log.user_id, log.Date)} style={deleteButtonStyle}>
                            🗑️ Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function MetricCard({ label, value, sublabel, color, highlight }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: highlight ? '0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
      border: highlight ? `2px solid ${color || '#007AFF'}` : 'none'
    }}>
      <div style={{ fontSize: '13px', color: '#86868b', fontWeight: '500', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ 
        fontSize: '32px', 
        fontWeight: '700', 
        color: color || '#1d1d1f',
        marginBottom: '4px'
      }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: '#6e6e73' }}>
        {sublabel}
      </div>
    </div>
  )
}