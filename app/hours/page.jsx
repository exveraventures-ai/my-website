"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Footer from '../components/Footer'
import HeatMap from '../components/HeatMap'
import Navigation from '../components/Navigation'
import { useIsMobile } from '../lib/useMediaQuery'
import { navigateTo } from '../lib/capacitorNavigation'

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

const dateInputStyle = {
  ...inputStyle,
  cursor: 'pointer'
}

const quickDateButtonStyle = {
  padding: '8px 16px',
  backgroundColor: 'white',
  color: '#4F46E5',
  border: '2px solid #4F46E5',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  fontFamily: 'inherit',
  transition: 'all 0.2s'
}

const quickDateButtonActiveStyle = {
  ...quickDateButtonStyle,
  backgroundColor: '#4F46E5',
  color: 'white'
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
    adjustment: 0,
    isHoliday: false
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
  const [methodologySectionCollapsed, setMethodologySectionCollapsed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedEntries, setSelectedEntries] = useState(new Set())
  const isMobile = useIsMobile()

  useEffect(() => {
    document.title = 'Burnout IQ - Working Hours'
  }, [])

  useEffect(() => {
    // Initialize with error handling
    checkUserAndFetch().catch(err => {
      console.error('Initialization failed:', err)
      setLoading(false)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('burnoutiQ_user_id')
    navigateTo('/login', router)
  }

  const checkUserAndFetch = async () => {
    try {
      setLoading(true)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        setLoading(false)
        navigateTo('/login', router)
        return
      }

      if (!session) {
        setLoading(false)
        navigateTo('/login', router)
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
          setLoading(false)
          navigateTo('/login?message=pending', router)
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
        setLoading(false)
        navigateTo('/profile', router)
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
          setLoading(false)
          navigateTo('/login?message=pending', router)
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
    }

    setLoading(false)
    } catch (error) {
      console.error('Error in checkUserAndFetch:', error)
      setLoading(false)
    }
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

    // If it's a day off, set hours to 0 regardless of times
    const totalHours = formData.isHoliday ? 0 : calculateHours(cleanStartTime, cleanEndTime, formData.adjustment)

    const { data, error} = await supabase
      .from('Work_Logs')
      .insert([
        {
          Date: formData.date,
          'Start Time': formData.isHoliday ? null : cleanStartTime,
          'End Time': formData.isHoliday ? null : cleanEndTime,
          adjustment: formData.isHoliday ? 0 : parseFloat(formData.adjustment || 0),
          hours: totalHours,
          user_id: userId,
          is_holiday: formData.isHoliday || false
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
        adjustment: 0,
        isHoliday: false
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
      adjustment: log.adjustment || 0,
      isHoliday: log.is_holiday || false
    })
  }

  const handleSaveEdit = async (user_id, originalDate) => {
    // If it's a day off, we don't need times
    if (!editData.isHoliday && (!editData.date || !editData.startTime || !editData.endTime)) {
      setMessage('Error: Please fill in all required fields')
      return
    }
    
    const cleanStartTime = editData.isHoliday ? null : validateAndFormatTime(editData.startTime)
    const cleanEndTime = editData.isHoliday ? null : validateAndFormatTime(editData.endTime)

    // If it's a day off, set hours to 0 regardless of times
    const totalHours = editData.isHoliday ? 0 : calculateHours(cleanStartTime, cleanEndTime, editData.adjustment)

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
          adjustment: editData.isHoliday ? 0 : parseFloat(editData.adjustment || 0),
          hours: totalHours,
          user_id: user_id,
          is_holiday: editData.isHoliday || false
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
          adjustment: editData.isHoliday ? 0 : parseFloat(editData.adjustment || 0),
          hours: totalHours,
          is_holiday: editData.isHoliday || false
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

  const handleBulkDelete = async () => {
    if (selectedEntries.size === 0) return
    
    const count = selectedEntries.size
    if (!window.confirm(`Are you sure you want to delete ${count} ${count === 1 ? 'entry' : 'entries'}?`)) return

    // Delete each selected entry
    const deletePromises = Array.from(selectedEntries).map(entryKey => {
      const [userId, date] = entryKey.split('|')
      return supabase
        .from('Work_Logs')
        .delete()
        .eq('user_id', userId)
        .eq('Date', date)
    })

    const results = await Promise.all(deletePromises)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) {
      setMessage(`Error deleting some entries: ${errors[0].error.message}`)
    } else {
      setMessage(`✓ Deleted ${count} ${count === 1 ? 'entry' : 'entries'} successfully`)
      setSelectedEntries(new Set())
      checkUserAndFetch()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const toggleEntrySelection = (user_id, date) => {
    const entryKey = `${user_id}|${date}`
    setSelectedEntries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(entryKey)) {
        newSet.delete(entryKey)
      } else {
        newSet.add(entryKey)
      }
      return newSet
    })
  }

  const toggleSelectAll = (logsToShow) => {
    if (selectedEntries.size === logsToShow.length) {
      // Deselect all
      setSelectedEntries(new Set())
    } else {
      // Select all visible
      const allKeys = new Set(logsToShow.map(log => `${log.user_id}|${log.Date}`))
      setSelectedEntries(allKeys)
    }
  }

  // ============================================================================

  const calculateL7DTotal = (targetDate, allLogs) => {
    const currentDate = new Date(targetDate)
    const sevenDaysAgo = new Date(currentDate)
    sevenDaysAgo.setDate(currentDate.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    currentDate.setHours(23, 59, 59, 999)

    let total = 0
    allLogs.forEach(log => {
      const logDate = new Date(log.Date)
      if (logDate >= sevenDaysAgo && logDate <= currentDate) {
        // Day off counts as 0 hours (explicitly logged)
        if (log.is_holiday) {
          total += 0
        } 
        // Only count completed entries (have both start and end time)
        else if (log['Start Time'] && log['End Time']) {
          total += parseFloat(log.hours || 0)
        }
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
    
    // Create map of logged days (completed entries + day offs, missing days = 0)
    const loggedDaysMap = {}
    workLogs.forEach(log => {
      const logDate = new Date(log.Date)
      if (logDate >= fourWeeksAgo && logDate <= today) {
        // Day off counts as 0 hours
        if (log.is_holiday) {
          loggedDaysMap[log.Date] = 0
        }
        // Only count completed entries (have both start and end time)
        else if (log['Start Time'] && log['End Time']) {
          loggedDaysMap[log.Date] = log.hours || 0
        }
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
    
    // Filter completed entries and day offs (both count as logged days), then sort by date
    const completedLogs = workLogs.filter(log => log.is_holiday || (log['Start Time'] && log['End Time']))
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
    
    // Create map of logged weekend days (completed entries + day offs)
    const loggedWeekendDays = {}
    workLogs.forEach(log => {
      const logDate = new Date(log.Date)
      if (logDate >= oneMonthAgo && logDate <= today) {
        // Day off counts as 0 hours
        if (log.is_holiday) {
          loggedWeekendDays[log.Date] = 0
        }
        // Only count completed entries (have both start and end time)
        else if (log['Start Time'] && log['End Time']) {
          loggedWeekendDays[log.Date] = parseFloat(log.hours || 0)
        }
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
  // HELPER FUNCTIONS FOR BURNOUT V2
  // ============================================================================
  
  // Find longest recent break (>7 days with <2h work per day)
  const findLongestRecentBreak = () => {
    if (workLogs.length === 0) return { days: 0, ended: null }
    
    const today = new Date()
    const ninetyDaysAgo = new Date(today)
    ninetyDaysAgo.setDate(today.getDate() - 90)
    
    // Filter completed entries and day offs
    const completedLogs = workLogs.filter(log => log.is_holiday || (log['Start Time'] && log['End Time']))
    const sortedLogs = [...completedLogs].sort((a, b) => new Date(a.Date) - new Date(b.Date))
    
    // Build map of all dates in last 90 days
    const dateMap = new Map()
    for (let d = new Date(ninetyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const log = sortedLogs.find(l => l.Date === dateStr)
      const hours = log ? (log.hours || 0) : 0
      dateMap.set(dateStr, hours)
    }
    
    // Find longest consecutive period with <2h per day
    let longestBreak = 0
    let currentBreak = 0
    let breakEndDate = null
    
    const dates = Array.from(dateMap.keys()).sort()
    for (const dateStr of dates) {
      const hours = dateMap.get(dateStr)
      if (hours < 2) {
        currentBreak++
        if (currentBreak > longestBreak) {
          longestBreak = currentBreak
          breakEndDate = dateStr
        }
      } else {
        currentBreak = 0
      }
    }
    
    return { days: longestBreak, ended: breakEndDate }
  }
  
  
  // Calculate high-streak days (consecutive >9h days)
  const calculateHighStreak = () => {
    if (workLogs.length === 0) return { currentStreak: 0, maxStreak: 0 }
    
    const completedLogs = workLogs
      .filter(log => log.is_holiday || (log['Start Time'] && log['End Time']))
      .sort((a, b) => new Date(b.Date) - new Date(a.Date))
    
    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 0
    
    for (const log of completedLogs) {
      const hours = parseFloat(log.hours || 0)
      if (hours > 9) {
        tempStreak++
        if (currentStreak === 0) currentStreak = tempStreak
        if (tempStreak > maxStreak) maxStreak = tempStreak
      } else {
        tempStreak = 0
        if (currentStreak > 0 && tempStreak === 0) {
          // Streak broken, stop counting current
          break
        }
      }
    }
    
    return { currentStreak, maxStreak }
  }
  
  // Days since last <6h day (recovery day)
  const calculateRecoveryDays = () => {
    if (workLogs.length === 0) return null
    
    const completedLogs = workLogs
      .filter(log => log.is_holiday || (log['Start Time'] && log['End Time']))
      .sort((a, b) => new Date(b.Date) - new Date(a.Date))
    
    for (let i = 0; i < completedLogs.length; i++) {
      const hours = parseFloat(completedLogs[i].hours || 0)
      if (hours < 6) {
        const logDate = new Date(completedLogs[i].Date)
        const today = new Date()
        const diffTime = today - logDate
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
      }
    }
    
    return null // No recovery day found
  }

  // ============================================================================
  // BURNOUT RISK SCORE V2
  // ============================================================================
  const calculateBurnoutRiskScore = () => {
    if (workLogs.length === 0) return null
    
    try {
      const today = new Date()
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(today.getDate() - 7)
      const ninetyDaysAgo = new Date(today)
      ninetyDaysAgo.setDate(today.getDate() - 90)
      
      const completedLogs = workLogs.filter(log => log.is_holiday || (log['Start Time'] && log['End Time']))
      
      // Calculate L7D and L90D
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
      
      const loggedDaysMap7 = {}
      const loggedDaysMap90 = {}
      completedLogs.forEach(log => {
        const logDate = new Date(log.Date)
        if (logDate >= sevenDaysAgo && logDate <= today) {
          loggedDaysMap7[log.Date] = log.hours || 0
        }
        if (logDate >= ninetyDaysAgo && logDate <= today) {
          loggedDaysMap90[log.Date] = log.hours || 0
        }
      })
      
      const total7 = all7Days.reduce((sum, date) => sum + (loggedDaysMap7[date] || 0), 0)
      const total90 = all90Days.reduce((sum, date) => sum + (loggedDaysMap90[date] || 0), 0)
      const l7dAvg = total7 / 7
      const l90dAvg = total90 / 90
      
      // Find longest break (dashboard methodology - simpler inline calculation)
      let longestBreak = 0
      let currentBreak = 0
      // Sort dates in ascending order (oldest to newest)
      const sortedDays = [...all90Days].sort((a, b) => {
        return new Date(a) - new Date(b)
      })
      for (const date of sortedDays) {
        const hours = loggedDaysMap90[date] || 0
        if (hours < 2) {
          currentBreak++
          longestBreak = Math.max(longestBreak, currentBreak)
        } else {
          currentBreak = 0
        }
      }
      
      // Extended break >7 days → full reset
      if (longestBreak > 7) {
        return {
          riskScore: 0,
          overallStatus: 'RECOVERED 🟢',
          overallColor: '#34C759',
          urgency: `🟢 Excellent: ${longestBreak}-day recovery break detected. Full system reset.`,
          breakdown: {
            intensity: 0,
            workload: 0,
            circadian: 0,
          l7d: (l7dAvg * 7).toFixed(1),
          recentIntensity: '0.00',
          streakMult: 1.0
          },
          recoveryBonus: longestBreak
        }
      }
      
      // Calculate score components (dashboard methodology - simplified)
      const recentIntensity = l90dAvg > 0 ? (l7dAvg / l90dAvg) : 1.0
      const intensityComponent = Math.min(40, recentIntensity * 40)
      
      const redEye = calculateRedEyeRatio()
      const redEyeVal = redEye ? parseFloat(redEye.ratio.replace('%', '')) : 0
      const circadianComponent = redEyeVal > 15 ? 20 : (redEyeVal > 10 ? 15 : 10)
      
      const r4w = calculateRolling4WeekAverage()
      const avgWeekly = r4w ? parseFloat(r4w.average) : 0
      const workloadComponent = avgWeekly > 80 ? 20 : (avgWeekly > 60 ? 15 : 10)
      
      // Holiday bonus
      let holidayBonus = 0
      if (longestBreak > 14) {
        holidayBonus = -50
      } else if (longestBreak > 7) {
        holidayBonus = -25
      }
      
      let riskScore = intensityComponent + workloadComponent + circadianComponent + holidayBonus
      riskScore = Math.max(0, Math.min(100, riskScore))
      
      // Determine status and color
      let overallStatus = 'SUSTAINABLE'
      let overallColor = '#34C759'
      let urgency = ''
      let recoveryCountdown = null
      
      if (riskScore >= 85) {
        overallStatus = 'CRITICAL 🔴'
        overallColor = '#FF3B30'
        recoveryCountdown = 2
        const recoveryDate = new Date(today)
        recoveryDate.setDate(today.getDate() + 2)
        urgency = `🔴 CRITICAL: L7D ${l7dAvg.toFixed(1)}h/day. 48h recovery by ${recoveryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}. ${'>'}80h/wk=2x errors (JAMA).`
      } else if (riskScore >= 60) {
        overallStatus = 'HIGH RISK 🟠'
        overallColor = '#FF9500'
        recoveryCountdown = 7
        urgency = `🟠 ALERT: Multiple burnout indicators. Delay DD. Lock weekend. L7D ${(l7dAvg * 7).toFixed(1)}h/wk critical for PE finance.`
      } else if (riskScore >= 30) {
        overallStatus = 'ELEVATED 🟡'
        overallColor = '#FF9500'
        recoveryCountdown = 14
        urgency = `🟡 CAUTION: Metrics elevated. Monitor closely. Plan recovery. Sleep debt=1.5x errors.`
      } else {
        overallStatus = 'SUSTAINABLE 🟢'
        overallColor = '#34C759'
        urgency = `🟢 GOOD: Metrics within healthy range. Maintain current rhythm.`
      }
      
      // Calculate recovery days for breakdown
      let recoveryDays = null
      for (const log of completedLogs.sort((a, b) => new Date(b.Date) - new Date(a.Date))) {
        const hours = parseFloat(log.hours || 0)
        if (hours < 6) {
          const logDate = new Date(log.Date)
          const diffTime = today - logDate
          recoveryDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          break
        }
      }
      
      return {
        riskScore: Math.round(riskScore),
        overallStatus,
        overallColor,
        urgency,
        recoveryCountdown,
        recoveryDays,
        breakdown: {
          intensity: intensityComponent.toFixed(1),
          workload: workloadComponent.toFixed(1),
          circadian: circadianComponent.toFixed(1),
          l7d: (l7dAvg * 7).toFixed(1),
          recentIntensity: recentIntensity.toFixed(2),
          streakMult: 1.0
        },
        recoveryBonus: holidayBonus
      }
    } catch (error) {
      console.error('Error calculating burnout risk score:', error)
      return null
    }
  }

  // ============================================================================
  // LOAD INTENSITY INDEX (moved before usage)
  // ============================================================================
  const calculateLoadIntensityIndex = () => {
    if (workLogs.length === 0) return null

    const today = new Date()
    
    // Find the first log date to determine actual logging period
    const completedLogs = workLogs.filter(log => log.is_holiday || (log['Start Time'] && log['End Time']))
    if (completedLogs.length === 0) return null
    
    const sortedLogs = [...completedLogs].sort((a, b) => new Date(a.Date) - new Date(b.Date))
    const firstLogDate = new Date(sortedLogs[0].Date)
    
    // Calculate actual days since first log
    const daysSinceFirstLog = Math.floor((today - firstLogDate) / (1000 * 60 * 60 * 24)) + 1
    
    // Determine periods: use actual days if less than target period
    const days7 = Math.min(7, daysSinceFirstLog)
    const days90 = Math.min(90, daysSinceFirstLog)
    
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - (days7 - 1))
    const ninetyDaysAgo = new Date(today)
    ninetyDaysAgo.setDate(today.getDate() - (days90 - 1))

    // Generate arrays of all days in periods (only from first log date onwards)
    const all7Days = []
    for (let i = 0; i < days7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      if (date >= firstLogDate) {
        all7Days.push(dateStr)
      }
    }
    
    const all90Days = []
    for (let i = 0; i < days90; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      if (date >= firstLogDate) {
        all90Days.push(dateStr)
      }
    }
    
    // Create maps of logged days (only completed entries, missing days = 0)
    const loggedDaysMap7 = {}
    const loggedDaysMap90 = {}
    workLogs.forEach(log => {
      // Count day offs as 0, skip incomplete entries
      if (!log.is_holiday && (!log['Start Time'] || !log['End Time'])) return
      const logDate = new Date(log.Date)
      if (logDate >= sevenDaysAgo && logDate <= today) {
        loggedDaysMap7[log.Date] = log.is_holiday ? 0 : (log.hours || 0)
      }
      if (logDate >= ninetyDaysAgo && logDate <= today) {
        loggedDaysMap90[log.Date] = log.is_holiday ? 0 : (log.hours || 0)
      }
    })
    
    // Calculate averages: sum all days (missing = 0, partial = 0) / actual days in period
    const total7 = all7Days.reduce((sum, date) => sum + (loggedDaysMap7[date] || 0), 0)
    const total90 = all90Days.reduce((sum, date) => sum + (loggedDaysMap90[date] || 0), 0)
    const h7 = all7Days.length > 0 ? total7 / all7Days.length : 0
    const h90 = all90Days.length > 0 ? total90 / all90Days.length : 0

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

    // Filter completed entries and day offs
    const currentWeekLogs = workLogs.filter(log => {
      if (!log.is_holiday && (!log['Start Time'] || !log['End Time'])) return false
      const logDate = new Date(log.Date)
      return logDate >= startOfWeek && logDate <= today
    })

    const workedSoFar = currentWeekLogs.reduce((sum, log) => sum + (log.is_holiday ? 0 : (log.hours || 0)), 0)

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
        avgWorkingDay: '0',
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

    // Filter completed entries and day offs
    const completedLogs = workLogs.filter(log => log.is_holiday || (log['Start Time'] && log['End Time']))
    
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

    // For all-time average, calculate only for weekdays (exclude weekends)
    let allTimeAvgDaily = '0'
    let avgWorkingDay = '0'
    if (completedLogs.length > 0) {
      const sortedLogs = [...completedLogs].sort((a, b) => new Date(a.Date) - new Date(b.Date))
      const firstDate = new Date(sortedLogs[0].Date)
      
      // Count all weekdays from first log to today
      let weekdayCount = 0
      let currentDate = new Date(firstDate)
      while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
          weekdayCount++
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      // Calculate total hours only from weekday logs
      const weekdayLogs = completedLogs.filter(log => {
        const logDate = new Date(log.Date)
        const dayOfWeek = logDate.getDay()
        return dayOfWeek !== 0 && dayOfWeek !== 6
      })
      const totalWeekdayHours = weekdayLogs.reduce((sum, log) => sum + (log.hours || 0), 0)
      
      // Average working day = total weekday hours / total weekdays (including days not logged)
      avgWorkingDay = weekdayCount > 0 ? (totalWeekdayHours / weekdayCount).toFixed(1) : '0'
      
      // Keep old calculation for compatibility
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
      avgWorkingDay,
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

      const actualHours = log ? (log.is_holiday ? 0 : parseFloat(log.hours || 0)) : 0
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
        hours: log.is_holiday ? '0.0' : parseFloat(log.hours || 0).toFixed(1),
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
  let highStreak, recoveryDays
  
  try {
    metrics = calculateAllMetrics()
    weeklyStats = calculateWeeklyStatistics()
    loadIntensityIndex = calculateLoadIntensityIndex()
    weeklyGoalPace = calculateWeeklyGoalPace()
    r4w = calculateRolling4WeekAverage()
    redEye = calculateRedEyeRatio()
    weekends = calculateProtectedWeekends()
    burnout = calculateBurnoutRiskScore()
    highStreak = calculateHighStreak()
    recoveryDays = calculateRecoveryDays()
    chartData = getFilteredData()
    dayOfWeekData = getDayOfWeekData()
    loadIntensityData = getLoadIntensityChartData()
    weeklyProgressData = getWeeklyProgressChartData()
  } catch (error) {
    console.error('Error calculating metrics:', error)
    // Set defaults to prevent crashes
    metrics = { l7dTotal: '0', l7dAvgDaily: '0', allTimeAvgDaily: '0', avgWorkingDay: '0', currentStreak: 0, l1m: '0', l3m: '0', l6m: '0', ytd: '0', ltm: '0' }
    weeklyStats = null
    loadIntensityIndex = null
    weeklyGoalPace = null
    r4w = null
    redEye = null
    weekends = null
    burnout = null
    highStreak = null
    recoveryDays = null
    chartData = []
    dayOfWeekData = []
    loadIntensityData = []
    weeklyProgressData = []
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--foreground)',
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            Burnout <span style={{ color: 'var(--primary)' }}>IQ</span>
          </div>
          <p style={{ fontSize: '16px', color: 'var(--muted-foreground)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      fontFamily: 'var(--font-sans)'
    }}>
      <Navigation userProfile={userProfile} />

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        padding: isMobile ? '20px 16px' : '60px 40px'
      }}>
        {/* Hero Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: isMobile ? '30px' : '60px'
        }}>
          <h1 style={{ 
            fontSize: isMobile ? '32px' : '64px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            color: '#1d1d1f',
            letterSpacing: '-0.03em'
          }}>
            Working Hours
          </h1>
          <p style={{ 
            fontSize: isMobile ? '18px' : '24px',
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
          padding: isMobile ? '20px' : '40px', 
          borderRadius: '16px',
          marginBottom: isMobile ? '30px' : '50px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '16px' : '0', marginBottom: '30px' }}>
            <h2 style={{ 
              fontSize: isMobile ? '24px' : '28px',
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
                gap: '8px',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a5a5f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6e6e73'}
            >
              📝 View/Edit Entries
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', flexWrap: isMobile ? 'nowrap' : 'wrap', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
            <div style={{ flex: isMobile ? 'none' : '1 1 200px', width: isMobile ? '100%' : 'auto' }}>
              <label style={labelStyle}>Date</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0]
                    setFormData({...formData, date: today})
                  }}
                  style={formData.date === new Date().toISOString().split('T')[0] ? quickDateButtonActiveStyle : quickDateButtonStyle}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const yesterday = new Date()
                    yesterday.setDate(yesterday.getDate() - 1)
                    const yesterdayStr = yesterday.toISOString().split('T')[0]
                    setFormData({...formData, date: yesterdayStr})
                  }}
                  style={(() => {
                    const yesterday = new Date()
                    yesterday.setDate(yesterday.getDate() - 1)
                    return formData.date === yesterday.toISOString().split('T')[0] ? quickDateButtonActiveStyle : quickDateButtonStyle
                  })()}
                >
                  Yesterday
                </button>
              </div>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                style={dateInputStyle}
              />
            </div>

            <div style={{ flex: isMobile ? 'none' : '1 1 140px', width: isMobile ? '100%' : 'auto' }}>
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

            <div style={{ flex: isMobile ? 'none' : '1 1 140px', width: isMobile ? '100%' : 'auto' }}>
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

            <div style={{ flex: isMobile ? 'none' : '1 1 140px', width: isMobile ? '100%' : 'auto' }}>
              <label style={labelStyle}>Adjustment (hrs)</label>
              <input
                type="number"
                step="0.5"
                value={formData.adjustment}
                onChange={(e) => setFormData({...formData, adjustment: e.target.value})}
                style={inputStyle}
              />
            </div>

            <div style={{ 
              flex: isMobile ? 'none' : '1 1 160px', 
              width: isMobile ? '100%' : 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 0'
            }}>
              <input
                type="checkbox"
                id="holiday-checkbox"
                checked={formData.isHoliday}
                onChange={(e) => setFormData({...formData, isHoliday: e.target.checked})}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#4F46E5'
                }}
              />
              <label 
                htmlFor="holiday-checkbox"
                style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#1d1d1f',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                🌙 Day Off
              </label>
            </div>

            <button type="submit" style={{...buttonStyle, width: isMobile ? '100%' : buttonStyle.flex, flex: isMobile ? 'none' : buttonStyle.flex}}>
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
              <div style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '12px' }}>
                {isPro ? burnout.urgency : 'Upgrade to Pro to see your burnout risk assessment'}
              </div>
              {isPro && burnout.breakdown && (
                <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    <div>Intensity: {burnout.breakdown.intensity}pts</div>
                    <div>Workload: {burnout.breakdown.workload}pts</div>
                    <div>Circadian: {burnout.breakdown.circadian}pts</div>
                  </div>
                  {burnout.recoveryBonus && burnout.recoveryBonus < 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.9 }}>
                      Holiday Bonus: {burnout.recoveryBonus}pts
                    </div>
                  )}
                </div>
              )}
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
                label="L7D Total vs. Historical Avg" 
                value={metrics.l7dTotal !== 'n.m.' ? metrics.l7dTotal + ' hrs' : '0 hrs'}
                sublabel={metrics.allTimeAvgDaily && metrics.allTimeAvgDaily !== '0' ? `Baseline: ${(parseFloat(metrics.allTimeAvgDaily) * 7).toFixed(1)} hrs/week (${parseFloat(metrics.l7dTotal) > parseFloat(metrics.allTimeAvgDaily) * 7 ? '+' : ''}${(parseFloat(metrics.l7dTotal) - parseFloat(metrics.allTimeAvgDaily) * 7).toFixed(1)} hrs)` : 'Last 7 days'}
              />
              <MetricCard 
                label="L7D Avg. vs. Average Working Day" 
                value={metrics.l7dAvgDaily !== 'n.m.' ? metrics.l7dAvgDaily + ' hrs' : '0 hrs'}
                sublabel={metrics.avgWorkingDay && metrics.avgWorkingDay !== '0' ? `Baseline: ${metrics.avgWorkingDay} hrs/day (${parseFloat(metrics.l7dAvgDaily) > parseFloat(metrics.avgWorkingDay) ? '+' : ''}${(parseFloat(metrics.l7dAvgDaily) - parseFloat(metrics.avgWorkingDay)).toFixed(1)} hrs)` : 'Per day'}
                color={metrics.avgWorkingDay && parseFloat(metrics.l7dAvgDaily) > parseFloat(metrics.avgWorkingDay) * 1.2 ? '#FF3B30' : metrics.avgWorkingDay && parseFloat(metrics.l7dAvgDaily) > parseFloat(metrics.avgWorkingDay) ? '#FF9500' : '#34C759'}
                highlight={metrics.avgWorkingDay && parseFloat(metrics.l7dAvgDaily) > parseFloat(metrics.avgWorkingDay) * 1.2}
              />
            {loadIntensityIndex && isPro && (
              <MetricCard 
                label="Load Intensity Index" 
                value={loadIntensityIndex.intensityIndex}
                sublabel={`${loadIntensityIndex.status} (L7D: ${loadIntensityIndex.h7}h, L90D: ${loadIntensityIndex.h90}h)`}
                color={loadIntensityIndex.color}
                highlight={parseFloat(loadIntensityIndex.intensityIndex) >= 130}
              />
            )}
            {weeklyGoalPace && (
              <MetricCard 
                label="Weekly Progress" 
                value={weeklyGoalPace.workedSoFar + '/' + weeklyGoalPace.weeklyTarget + ' hrs'}
                sublabel={`${weeklyGoalPace.paceStatus} (${weeklyGoalPace.delta > 0 ? '+' : ''}${weeklyGoalPace.delta} hrs)`}
              />
            )}
            {highStreak && isPro && (
              <MetricCard 
                label="High-Streak" 
                value={highStreak.currentStreak}
                sublabel={`Consecutive >9h days (max: ${highStreak.maxStreak})`}
                color={highStreak.currentStreak >= 3 ? '#FF9500' : '#007AFF'}
                highlight={highStreak.currentStreak >= 3}
              />
            )}
            {recoveryDays !== null && isPro && (
              <MetricCard 
                label="Recovery Days" 
                value={recoveryDays}
                sublabel={recoveryDays > 14 ? '🟡 Schedule <6h day' : recoveryDays > 7 ? '🟠 Monitor' : '🟢 Recent recovery'}
                color={recoveryDays > 14 ? '#FF9500' : recoveryDays > 7 ? '#FF3B30' : '#34C759'}
                highlight={recoveryDays > 14}
              />
            )}
          </div>
        </div>
        )}

        {/* METHODOLOGY SECTION */}
        <div id="methodology" style={{ 
          marginBottom: '50px',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          border: '1px solid #e8e8ed'
        }}>
          {/* Header with Collapse Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: methodologySectionCollapsed ? '0' : '24px' }}>
            <h2 style={{
              fontSize: isMobile ? '24px' : '28px',
              fontWeight: '600',
              margin: '0',
              color: '#1d1d1f'
            }}>
              How Burnout Metrics Work
            </h2>
            <button
              onClick={() => setMethodologySectionCollapsed(!methodologySectionCollapsed)}
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
                borderRadius: '8px',
                minWidth: '44px',
                minHeight: '44px'
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
              {methodologySectionCollapsed ? '▼' : '▲'}
            </button>
          </div>
          
          {!methodologySectionCollapsed && (
            <div style={{ paddingTop: '8px' }}>
              {/* Overview */}
              <p style={{
                fontSize: '16px',
                color: '#1d1d1f',
                lineHeight: '1.6',
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f5f5f7',
                borderRadius: '8px'
              }}>
                The Burnout Risk Score combines four daily-tracked metrics using your completed work logs (entries with start and end times); unlogged days count as zero hours.
              </p>

              {/* Metrics List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Rolling Four-Week Average */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9f9fb',
                  borderRadius: '8px',
                  border: '1px solid #e8e8ed'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>1.</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                        Rolling Four-Week Average
                      </div>
                      <div style={{ fontSize: '15px', color: '#6e6e73', lineHeight: '1.5', marginBottom: '8px' }}>
                        The average weekly working hours calculated by summing all hours over the last 28 days (unlogged days are zero) and dividing by four.
                      </div>
                      {r4w && (
                        <div style={{ fontSize: '14px', color: '#86868b', fontStyle: 'italic' }}>
                          Your 4-week avg: {r4w.average}h/week → {r4w.status}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Red-Eye Ratio */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9f9fb',
                  borderRadius: '8px',
                  border: '1px solid #e8e8ed'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>2.</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                        Red-Eye Ratio
                      </div>
                      <div style={{ fontSize: '15px', color: '#6e6e73', lineHeight: '1.5', marginBottom: '8px' }}>
                        The percentage of total hours spent working between 10 PM and 6 AM over the last 30 days, handling overnight shifts by wrapping around midnight.
                      </div>
                      {redEye && (
                        <div style={{ fontSize: '14px', color: '#86868b', fontStyle: 'italic' }}>
                          Your red-eye ratio: {redEye.ratio}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Protected Weekends */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9f9fb',
                  borderRadius: '8px',
                  border: '1px solid #e8e8ed'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>3.</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                        Protected Weekends
                      </div>
                      <div style={{ fontSize: '15px', color: '#6e6e73', lineHeight: '1.5', marginBottom: '8px' }}>
                        The percentage of weekend days (Saturday and Sunday) over the last 30 days with zero or 0.5 hours or less of work, plus the length of the longest recent break of consecutive days with two hours or less.
                      </div>
                      {weekends && (
                        <div style={{ fontSize: '14px', color: '#86868b', fontStyle: 'italic' }}>
                          Your protection: {weekends.protectionRate} ({weekends.protectedWeekendDays}/{weekends.totalWeekendDays} days protected)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Burnout Risk Score */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9f9fb',
                  borderRadius: '8px',
                  border: '1px solid #e8e8ed'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>4.</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                        Burnout Risk Score
                      </div>
                      <div style={{ fontSize: '15px', color: '#6e6e73', lineHeight: '1.5', marginBottom: '8px' }}>
                        A 0-100 score adding components from recent intensity (last seven days versus 90 days average ratio), four-week workload, and red-eye circadian disruption, minus bonuses for long recovery breaks.
                      </div>
                      {burnout && burnout.breakdown && (
                        <div style={{ fontSize: '14px', color: '#86868b', fontStyle: 'italic' }}>
                          Your score: {burnout.riskScore}/100 ({burnout.overallStatus}) · Components: Intensity {burnout.breakdown.intensity}pts, Workload {burnout.breakdown.workload}pts, Circadian {burnout.breakdown.circadian}pts
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#f5f5f7',
                borderRadius: '8px',
                borderTop: '2px solid #e8e8ed',
                fontSize: '14px',
                color: '#6e6e73',
                lineHeight: '1.5'
              }}>
                All metrics recalculate live from your logs. Questions? Edit logs below.
              </div>
            </div>
          )}
        </div>

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

        {/* Work Hours Heatmap - L180D Pattern Analysis */}
        <div style={{ marginBottom: '50px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ 
                  fontSize: '28px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: '#1d1d1f'
                }}>
                  Work Hours Heatmap (L180D)
                </h2>
                <p style={{ 
                  fontSize: '15px',
                  color: '#6e6e73',
                  margin: 0
                }}>
                  Average hours worked by day and hour. Aggregated from last 180 days.
                </p>
              </div>
              {isPro && (
                <a href="/science" style={{
                  padding: '10px 20px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap'
                }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}>
                  📚 Research Basis
                </a>
              )}
            </div>
            
            <HeatMap workLogs={workLogs} isPro={isPro} />
          </div>
        </div>

        {/* Recent Entries Table */}
        <div id="recent-entries" style={{ 
          backgroundColor: 'white', 
          padding: isMobile ? '20px' : '40px', 
          borderRadius: '16px',
          marginBottom: isMobile ? '30px' : '50px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '16px' : '0', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <h2 style={{ 
                fontSize: isMobile ? '24px' : '28px',
                fontWeight: '600',
                margin: 0,
                color: '#1d1d1f'
              }}>
                Recent Entries
              </h2>
              {selectedEntries.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#FF3B30',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF2D20'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF3B30'}
                >
                  🗑️ Delete Selected ({selectedEntries.size})
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
          </div>
          <div style={{ 
            overflowX: 'auto',
            maxHeight: showAllEntries ? '600px' : 'none',
            overflowY: showAllEntries ? 'auto' : 'visible'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: showAllEntries ? 'sticky' : 'static', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                <tr style={{ borderBottom: '2px solid #e8e8ed' }}>
                  <th style={{...tableHeaderStyle, width: '50px', padding: '16px 8px'}}>
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
                      const allSelected = logsToShow.length > 0 && logsToShow.every(log => selectedEntries.has(`${log.user_id}|${log.Date}`))
                      return (
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleSelectAll(logsToShow)}
                          style={{
                            cursor: 'pointer',
                            width: '18px',
                            height: '18px'
                          }}
                        />
                      )
                    })()}
                  </th>
                  <th style={tableHeaderStyle}>Date</th>
                  <th style={tableHeaderStyle}>Start Time</th>
                  <th style={tableHeaderStyle}>End Time</th>
                  <th style={tableHeaderStyle}>Adjustment</th>
                  <th style={tableHeaderStyle}>Day Off</th>
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
                  
                  return logsToShow.map((log) => {
                    const entryKey = `${log.user_id}|${log.Date}`
                    const isSelected = selectedEntries.has(entryKey)
                    return (
                  <tr key={`${log.user_id}-${log.Date}`} style={{ borderBottom: '1px solid #f5f5f7', backgroundColor: isSelected ? '#f0f4ff' : 'transparent' }}>
                    {editingLog && editingLog.user_id === log.user_id && editingLog.date === log.Date ? (
                      <>
                        <td style={tableCellStyle}></td>
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
                          <input
                            type="checkbox"
                            checked={editData.isHoliday || false}
                            onChange={(e) => setEditData({...editData, isHoliday: e.target.checked})}
                            style={{
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              accentColor: '#4F46E5'
                            }}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          {editData.isHoliday ? '0.00' : calculateHours(editData.startTime || '00:00', editData.endTime || '00:00', editData.adjustment || 0).toFixed(2)} hrs
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
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleEntrySelection(log.user_id, log.Date)}
                            style={{
                              cursor: 'pointer',
                              width: '18px',
                              height: '18px'
                            }}
                          />
                        </td>
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
                        <td style={tableCellStyle}>
                          {log.is_holiday ? '🌙 Yes' : '-'}
                        </td>
                        <td style={tableCellStyle}>
                          {log.is_holiday ? '0.00 hrs' : `${parseFloat(log.hours || 0).toFixed(2)} hrs`}
                        </td>
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
                  )
                  })
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