"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Footer from '../components/Footer'

export default function Dashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [workLogs, setWorkLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [cohortStats, setCohortStats] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    document.title = 'Burnout IQ - Dashboard'
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
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    let storedUserId = localStorage.getItem('burnoutiQ_user_id')
    
    if (!storedUserId) {
      // Try to get user profile by email
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()
      
      if (profile) {
        // Check if user is approved (unless they're an admin)
        if (!profile.is_approved && !profile.is_admin) {
          await supabase.auth.signOut()
          router.push('/login?message=pending')
          return
        }
        
        localStorage.setItem('burnoutiQ_user_id', profile.id)
        storedUserId = profile.id
        setUserId(profile.id)
        setUserProfile(profile)
      } else {
        router.push('/profile')
        return
      }
    } else {
      setUserId(storedUserId)

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', storedUserId)
        .single()
      
      if (profile) {
        // Check if user is approved (unless they're an admin)
        if (!profile.is_approved && !profile.is_admin) {
          await supabase.auth.signOut()
          router.push('/login?message=pending')
          return
        }
        
        setUserProfile(profile)
      }
    }

    const { data: logs } = await supabase
      .from('Work_Logs')
      .select('*')
      .eq('user_id', storedUserId)
      .order('Date', { ascending: true })

    if (logs) {
      setWorkLogs(logs)
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', storedUserId)
      .single()

    if (profile) {
      await fetchCohortStats(profile)
    }

    setLoading(false)
  }

  const fetchCohortStats = async (profile) => {
    const cohortKey = `${profile.position}_${profile.region}`
    
    const { data } = await supabase
      .from('cohort_stats')
      .select('*')
      .eq('cohort_key', cohortKey)
      .single()
    
    if (data) {
      setCohortStats(data)
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

  const calculateSummaryMetrics = () => {
    if (workLogs.length === 0) return null

    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    // Filter only completed entries (have both start and end time)
    const completedLogs = workLogs.filter(log => log['Start Time'] && log['End Time'])
    
    // L7D calculations - count all 7 days (missing days = 0)
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
    
    const l7dTotal = all7Days.reduce((sum, date) => sum + (loggedDaysMap[date] || 0), 0)
    const l7dAvgDaily = (l7dTotal / 7).toFixed(1) // Always divide by 7 days

    // Historical average - calculate from first log date to today (missing days = 0)
    let allTimeAvgDaily = 'n.m.'
    let allTimeAvgWeekly = 'n.m.'
    if (completedLogs.length > 0) {
      const sortedLogs = [...completedLogs].sort((a, b) => new Date(a.Date) - new Date(b.Date))
      const firstDate = new Date(sortedLogs[0].Date)
      const daysSinceFirst = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24)) + 1
      const total = completedLogs.reduce((sum, log) => sum + (log.hours || 0), 0)
      allTimeAvgDaily = (total / daysSinceFirst).toFixed(1)
      allTimeAvgWeekly = (parseFloat(allTimeAvgDaily) * 7).toFixed(1)
    }

    // Intensity ratio
    const intensityRatio = (l7dAvgDaily !== 'n.m.' && allTimeAvgDaily !== 'n.m.')
      ? (parseFloat(l7dAvgDaily) / parseFloat(allTimeAvgDaily)).toFixed(2)
      : 'n.m.'

    let intensityStatus = 'Normal'
    let intensityColor = '#06B6D4'
    if (intensityRatio !== 'n.m.') {
      const ratio = parseFloat(intensityRatio)
      if (ratio >= 1.3) {
        intensityStatus = 'High'
        intensityColor = '#FF3B30'
      } else if (ratio >= 1.15) {
        intensityStatus = 'Elevated'
        intensityColor = '#FF9500'
      } else if (ratio <= 0.85) {
        intensityStatus = 'Light'
        intensityColor = '#4F46E5'
      }
    }

    // Streak calculation - only count completed entries
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

    // Cohort comparison
    let cohortComparison = null
    if (cohortStats && l7dTotal > 0) {
      const vsMedian = ((l7dTotal / cohortStats.median_weekly_hours) * 100 - 100).toFixed(0)
      cohortComparison = {
        vsMedian: vsMedian,
        medianHours: cohortStats.median_weekly_hours,
        userCount: cohortStats.user_count
      }
    }

    return {
      l7dTotal: l7dTotal.toFixed(1),
      l7dAvgDaily,
      allTimeAvgDaily,
      allTimeAvgWeekly,
      intensityRatio,
      intensityStatus,
      intensityColor,
      currentStreak,
      cohortComparison
    }
  }

  // ============================================================================
  // ROLLING 4-WEEK AVERAGE
  // ============================================================================
  const calculateRolling4WeekAverage = () => {
    if (workLogs.length === 0) return null
    
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
    
    // Calculate total: sum all 28 days (missing days = 0)
    const total = all28Days.reduce((sum, date) => sum + (loggedDaysMap[date] || 0), 0)
    // Convert to weekly average: total hours over 28 days = average hours per week
    const average = (total / 28) * 7 // Daily average * 7 days = weekly average
    
    let status = 'Healthy'
    let color = '#06B6D4'
    
    if (average > 80) {
      status = 'CRITICAL'
      color = '#FF3B30'
    } else if (average > 75) {
      status = 'Caution'
      color = '#FF9500'
    } else if (average > 60) {
      status = 'Active Diligence'
      color = '#4F46E5'
    } else {
      status = 'Portfolio Mode'
      color = '#34C759'
    }
    
    return {
      average: average.toFixed(1), // Weekly average (already calculated as (total/28)*7)
      status,
      color,
      total: total.toFixed(1)
    }
  }

  // ============================================================================
  // WORST WEEK EVER
  // ============================================================================
  const calculateWorstWeekEver = () => {
    if (workLogs.length === 0) return null

    // Group logs by week ending Sunday (Sunday is day 0, so week runs Mon-Sun, ending on Sunday)
    // Only count completed entries (have both start and end time)
    const weeklyTotals = {}

    workLogs.forEach(log => {
      // Skip partial entries
      if (!log['Start Time'] || !log['End Time']) return
      
      const logDate = new Date(log.Date)
      logDate.setHours(0, 0, 0, 0)
      const dayOfWeek = logDate.getDay() // 0 = Sunday, 1 = Monday, etc.
      
      // Find the Sunday that ends this week
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

    // Find the worst week
    let worstWeekTotal = 0
    let worstWeekKey = null

    Object.entries(weeklyTotals).forEach(([weekKey, total]) => {
      if (total > worstWeekTotal) {
        worstWeekTotal = total
        worstWeekKey = weekKey
      }
    })

    if (!worstWeekKey) return null

    return {
      total: worstWeekTotal.toFixed(1),
      weekEnding: worstWeekKey
    }
  }

  // ============================================================================
  // RED-EYE RATIO (Hours worked 10 PM - 6 AM)
  // ============================================================================
  const calculateRedEyeRatio = () => {
    if (workLogs.length === 0) return null
    
    let lateNightHours = 0
    let totalHours = 0
    
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
        } else if (endMins <= earlyMorning) {
          lateNightHours += endMins / 60
        }
      } else {
        if (startMins < earlyMorning || endMins > lateNightStart) {
          const overlapStart = Math.max(startMins, lateNightStart)
          const overlapEnd = Math.min(endMins + 1440, earlyMorning + 1440)
          if (overlapStart < overlapEnd) {
            lateNightHours += (overlapEnd - overlapStart) / 60
          }
        }
      }
      
      totalHours += dailyHours
    })
    
    const ratio = totalHours > 0 ? (lateNightHours / totalHours * 100).toFixed(1) : 0
    
    let status = 'Healthy'
    let color = '#06B6D4'
    
    if (ratio > 20) {
      status = 'CRITICAL'
      color = '#FF3B30'
    } else if (ratio > 15) {
      status = 'High'
      color = '#FF3B30'
    } else if (ratio > 10) {
      status = 'Moderate'
      color = '#FF9500'
    } else {
      status = 'Healthy'
      color = '#34C759'
    }
    
    return {
      ratio: ratio + '%',
      status,
      color,
      lateNightHours: lateNightHours.toFixed(1)
    }
  }

   // ============================================================================
  // PROTECTED WEEKEND BLOCKS
  // ============================================================================
  const calculateProtectedWeekends = () => {
    if (workLogs.length === 0) return null
    
    const today = new Date()
    const oneMonthAgo = new Date(today)
    oneMonthAgo.setDate(today.getDate() - 30)
    
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
    
    // Determine status based on protection rate
    let status, color
    
    if (protectionRate >= 75) {
      status = 'Protected'
      color = '#34C759'
    } else if (protectionRate >= 50) {
      status = 'Caution'
      color = '#FF9500'
    } else {
      status = 'At Risk'
      color = '#FF3B30'
    }
    
    return {
      protectionRate: protectionRate + '%',
      protectedWeekendDays,
      totalWeekendDays,
      status,
      color
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
    
    const daysNoBreak = weekends.daysSinceLastFull24h
    if (daysNoBreak > 14) riskScore += 25
    else if (daysNoBreak > 10) riskScore += 20
    else if (daysNoBreak > 7) riskScore += 10
    else riskScore += 3
    
    let overallStatus = 'Healthy'
    let overallColor = '#06B6D4'
    
    if (riskScore >= 85) {
      overallStatus = 'CRITICAL'
      overallColor = '#FF3B30'
    } else if (riskScore >= 60) {
      overallStatus = 'HIGH RISK'
      overallColor = '#FF3B30'
    } else if (riskScore >= 40) {
      overallStatus = 'ELEVATED'
      overallColor = '#FF9500'
    } else {
      overallStatus = 'SUSTAINABLE'
      overallColor = '#34C759'
    }
    
    return {
      riskScore,
      overallStatus,
      overallColor
    }
  }

  // ============================================================================
  // LOAD INTENSITY INDEX
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
    
    // Calculate averages: sum all days (missing = 0) / total days
    const total7 = all7Days.reduce((sum, date) => sum + (loggedDaysMap7[date] || 0), 0)
    const total90 = all90Days.reduce((sum, date) => sum + (loggedDaysMap90[date] || 0), 0)
    const h7 = total7 / 7 // Always divide by 7
    const h90 = total90 / 90 // Always divide by 90

    const intensityIndex = h90 > 0 ? ((h7 / h90) * 100).toFixed(1) : 0

    let status = 'Normal'
    let color = '#06B6D4'
    if (intensityIndex >= 130) {
      status = 'Very High'
      color = '#FF3B30'
    } else if (intensityIndex >= 115) {
      status = 'Elevated'
      color = '#FF9500'
    } else if (intensityIndex <= 85) {
      status = 'Light'
      color = '#4F46E5'
    }

    return {
      intensityIndex,
      status,
      color,
      h7: h7.toFixed(1),
      h90: h90.toFixed(1)
    }
  }

  const getLast30DaysChartData = () => {
    if (workLogs.length === 0) return []

    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    // Filter to only completed entries (have both start and end time)
    const filteredLogs = workLogs.filter(log => {
      if (!log['Start Time'] || !log['End Time']) return false
      return new Date(log.Date) >= thirtyDaysAgo
    })

    // Sort all workLogs by date for L7D calculation
    const allLogsSorted = [...workLogs].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

    return filteredLogs.map((log, index) => {
      // Use all logs to calculate L7D, not just filtered logs
      const l7dTotal = parseFloat(calculateL7DTotal(log.Date, allLogsSorted))
      
      return {
        date: new Date(log.Date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        hours: parseFloat(log.hours || 0).toFixed(1),
        l7dTotal: l7dTotal,
        fullDate: log.Date
      }
    })
  }

  const metrics = calculateSummaryMetrics()
  const chartData = getLast30DaysChartData()
  const burnoutRisk = calculateBurnoutRiskScore()
  const loadIntensityIndex = calculateLoadIntensityIndex()
  const rolling4Week = calculateRolling4WeekAverage()
  const redEye = calculateRedEyeRatio()
  const protectedWeekends = calculateProtectedWeekends()
  const worstWeekEver = calculateWorstWeekEver()

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
      {/* Navigation Banner */}
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
          gap: '30px',
          flexWrap: 'wrap'
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
          
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="/dashboard" onClick={() => setShowProfileMenu(false)} style={{...navLinkStyle, fontWeight: '600', color: '#007AFF'}}>Dashboard</a>
            <a href="/hours" onClick={() => setShowProfileMenu(false)} style={navLinkStyle}>Working Hours</a>
            <a href="/health" onClick={() => setShowProfileMenu(false)} style={navLinkStyle}>Health Stats</a>
            <a href="/compare" onClick={() => setShowProfileMenu(false)} style={navLinkStyle}>Comparisons</a>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: userProfile?.is_pro ? '#FFD700' : '#4F46E5',
                  color: userProfile?.is_pro ? '#1d1d1f' : 'white',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Profile
                {userProfile?.is_pro && <span style={{ fontSize: '12px', fontWeight: '700' }}>✨</span>}
                <span style={{ fontSize: '10px' }}>▼</span>
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
                    zIndex: 1000,
                    minWidth: '240px',
                    overflow: 'hidden'
                  }}>
                    {userProfile && (
                      <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #e8e8ed'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px' }}>
                          {userProfile.email}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6e6e73' }}>
                          {userProfile.position} · {userProfile.company}
                        </div>
                      </div>
                    )}
                    <a
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        color: '#1d1d1f',
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontFamily: 'inherit',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      ⚙️ Edit Profile
                    </a>
                    <a
                      href="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        color: '#1d1d1f',
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontFamily: 'inherit',
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
                          padding: '12px 16px',
                          color: '#1d1d1f',
                          textDecoration: 'none',
                          fontSize: '15px',
                          fontFamily: 'inherit',
                          transition: 'background-color 0.2s',
                          borderTop: '1px solid #e8e8ed'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        👑 Admin Panel
                      </a>
                    )}
                    <div style={{
                      borderTop: '1px solid #e8e8ed'
                    }}>
                      <button
                        onClick={handleSignOut}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          backgroundColor: 'transparent',
                          color: '#FF3B30',
                          border: 'none',
                          borderRadius: '0',
                          fontWeight: '600',
                          fontSize: '15px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          textAlign: 'left',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        🚪 Sign Out
                      </button>
                    </div>
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
          marginBottom: '60px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '64px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              color: '#1d1d1f',
              letterSpacing: '-0.03em'
            }}>
              Dashboard
            </h1>
            <p style={{ 
              fontSize: '24px',
              color: '#6e6e73',
              fontWeight: '400',
              margin: '0 0 8px 0',
              letterSpacing: '-0.01em'
            }}>
              Your performance at a glance
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
          {metrics && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              backgroundColor: '#f5f5f7',
              borderRadius: '16px',
              border: '2px solid #e8e8ed'
            }}>
              <div style={{ fontSize: '32px' }}>
                {metrics.currentStreak >= 30 ? '🔥🔥🔥' : metrics.currentStreak >= 15 ? '🔥🔥' : metrics.currentStreak >= 7 ? '🔥' : metrics.currentStreak > 0 ? '⭐' : '📅'}
              </div>
              <div>
                <div style={{
                  fontSize: '13px',
                  color: '#86868b',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px'
                }}>
                  Current Streak
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1d1d1f'
                }}>
                  {metrics.currentStreak} {metrics.currentStreak === 1 ? 'day' : 'days'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Grid - 4 Column Layout (2x2 LHS, 2x2 RHS) */}
        {metrics && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '50px'
          }}>
            {/* Position 1: L7D Total (Col 1, Row 1) */}
            <QuickStatCard 
              icon="⏱️"
              label="L7D Total" 
              value={metrics.l7dTotal}
              unit="hrs"
              sublabel="Last 7 days"
              link="/hours"
            />
            {/* Position 2: 4-Week Average (Col 2, Row 1) */}
            {rolling4Week && (
              <QuickStatCard 
                icon="📊"
                label="4-Week Average" 
                value={rolling4Week.average}
                unit="hrs/week"
                sublabel={rolling4Week.status}
                color={rolling4Week.color}
                link="/hours"
              />
            )}
            {/* Position 3: Burnout Risk (Col 3, Row 1) */}
            {burnoutRisk && (
              <QuickStatCard 
                icon="🔥"
                label="Burnout Risk" 
                value={userProfile?.is_pro ? burnoutRisk.riskScore : 'n.a.'}
                unit={userProfile?.is_pro ? "/100" : ""}
                sublabel={userProfile?.is_pro ? burnoutRisk.overallStatus : 'Pro feature'}
                color={userProfile?.is_pro ? burnoutRisk.overallColor : '#86868b'}
                link={userProfile?.is_pro ? "/hours" : "/upgrade"}
                isPro={!userProfile?.is_pro}
              />
            )}
            {/* Position 4: Load Intensity Index (Col 4, Row 1) */}
            {loadIntensityIndex && (
              <QuickStatCard 
                icon="⚡"
                label="Load Intensity Index" 
                value={userProfile?.is_pro ? loadIntensityIndex.intensityIndex : 'n.a.'}
                unit={userProfile?.is_pro ? "%" : ""}
                sublabel={userProfile?.is_pro ? loadIntensityIndex.status : 'Pro feature'}
                color={userProfile?.is_pro ? loadIntensityIndex.color : '#86868b'}
                link={userProfile?.is_pro ? "/hours" : "/upgrade"}
                isPro={!userProfile?.is_pro}
              />
            )}
            {/* Position 5: Lifetime Average (Col 1, Row 2) */}
            <QuickStatCard 
              icon="📈"
              label="Lifetime Average" 
              value={metrics.allTimeAvgWeekly}
              unit="hrs/week"
              sublabel="All-time weekly average"
              link="/hours"
            />
            {/* Position 6: Worst Week Ever (Col 2, Row 2) */}
            {worstWeekEver && (
              <QuickStatCard 
                icon="📉"
                label="Worst Week Ever" 
                value={worstWeekEver.total}
                unit="hrs"
                sublabel="Peak weekly hours"
                link="/hours"
              />
            )}
            {!worstWeekEver && <div></div>}
            {/* Position 7: Circadian Disruption Index (Col 3, Row 2) */}
            {redEye && (
              <QuickStatCard 
                icon="🌙"
                label="Circadian Disruption Index" 
                value={userProfile?.is_pro ? redEye.ratio : 'n.a.'}
                unit=""
                sublabel={userProfile?.is_pro ? redEye.status : 'Pro feature'}
                color={userProfile?.is_pro ? redEye.color : '#86868b'}
                link={userProfile?.is_pro ? "/hours" : "/upgrade"}
                isPro={!userProfile?.is_pro}
              />
            )}
            {/* Position 8: Recovery Window Status (Col 4, Row 2) */}
            {protectedWeekends && (
              <QuickStatCard 
                icon="🏖️"
                label="Recovery Window Status" 
                value={userProfile?.is_pro ? protectedWeekends.protectionRate : 'n.a.'}
                unit=""
                sublabel={userProfile?.is_pro ? protectedWeekends.status : 'Pro feature'}
                color={userProfile?.is_pro ? protectedWeekends.color : '#86868b'}
                link={userProfile?.is_pro ? "/hours" : "/upgrade"}
                isPro={!userProfile?.is_pro}
              />
            )}
            
            {/* Pro Features Upgrade Card - Positioned under RHS 2x2 (Col 3-4, Row 3) */}
            {!userProfile?.is_pro && (
              <div style={{ 
                gridColumn: '3 / 5',
                backgroundColor: 'rgba(0,122,255,0.1)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(0,122,255,0.3)',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1d1d1f',
                  margin: '0 0 16px 0'
                }}>
                  Pro Features
                </h3>
                <a href="/upgrade" style={{
                  display: 'inline-block',
                  padding: '14px 28px',
                  backgroundColor: '#FFD700',
                  color: '#1d1d1f',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600'
                }}>
                  Upgrade to Pro - £1.99/month
                </a>
              </div>
            )}
          </div>
        )}

        {/* Cohort Comparison Banner */}
        {metrics?.cohortComparison && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px 40px',
            borderRadius: '16px',
            marginBottom: '50px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '2px solid #4F46E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h3 style={{ 
                fontSize: '15px',
                color: '#007AFF',
                fontWeight: '600',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                📊 Peer Benchmark
              </h3>
              <p style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0', color: '#1d1d1f' }}>
                {metrics.cohortComparison.vsMedian > 0 ? '+' : ''}{metrics.cohortComparison.vsMedian}% vs median
              </p>
              <p style={{ fontSize: '15px', color: '#6e6e73', margin: 0 }}>
                vs {metrics.cohortComparison.userCount} {userProfile.position}s in {userProfile.region}
              </p>
            </div>
            <a 
              href="/compare"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#4F46E5',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '20px',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              View Detailed Comparison →
            </a>
          </div>
        )}

        {/* Working Hours Chart - Full Width */}
        <div style={{ marginBottom: '50px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '24px',
                fontWeight: '600',
                margin: 0,
                color: '#1d1d1f'
              }}>
                Working Hours (L30D)
              </h2>
              <a href="/hours" style={{
                color: '#007AFF',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                View Details →
              </a>
            </div>
            {chartData.length === 0 ? (
              <div style={{ 
                padding: '60px 20px', 
                textAlign: 'center',
                color: '#6e6e73'
              }}>
                <p style={{ fontSize: '17px', margin: '0 0 16px 0' }}>No work hours logged yet</p>
                <a href="/hours" style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontWeight: '600'
                }}>
                  Log Your First Day
                </a>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={600}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: '#6e6e73', fontSize: 11 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: '#6e6e73', fontSize: 11 }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#6e6e73', fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.98)', 
                      border: '1px solid #d2d2d7',
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}
                  />
                  <Bar yAxisId="left" dataKey="hours" fill="#4F46E5" name="Daily Hours" radius={[4, 4, 0, 0]} />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="l7dTotal" 
                    stroke="#FF3B30" 
                    strokeWidth={2}
                    name="L7D Total" 
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Health Stats - Coming Soon */}
        <div style={{ marginBottom: '50px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>💪</div>
            <h2 style={{ 
              fontSize: '32px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: '#1d1d1f'
            }}>
              Health Stats
            </h2>
            <p style={{ 
              fontSize: '19px',
              color: '#6e6e73',
              margin: '0 0 24px 0',
              lineHeight: 1.6
            }}>
              Coming soon
            </p>
            <a href="/health" style={{
              display: 'inline-block',
              padding: '12px 28px',
              backgroundColor: '#4F46E5',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '15px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0051D5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007AFF'}
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px'
        }}>
          <ActionCard 
            icon="⏱️"
            title="Log Hours"
            description="Record your daily work hours"
            link="/hours"
            linkText="Log Now"
          />
          <ActionCard 
            icon="📊"
            title="View Analytics"
            description="Deep dive into your work patterns"
            link="/hours"
            linkText="View Details"
          />
          <ActionCard 
            icon="👥"
            title="Compare with Peers"
            description="See how you stack up against your cohort"
            link="/compare"
            linkText="View Comparison"
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}

const navLinkStyle = {
  color: '#1d1d1f',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'opacity 0.2s'
}

function QuickStatCard({ icon, label, value, unit, sublabel, color, isPro, link, gridColumn }) {
  const content = (
    <div style={{ 
      padding: '28px', 
      backgroundColor: isPro ? '#f5f5f7' : 'white',
      borderRadius: '16px',
      border: color ? `2px solid ${color}` : '1px solid #e8e8ed',
      boxShadow: isPro ? '0 2px 8px rgba(0,0,0,0.03)' : '0 4px 16px rgba(0,0,0,0.06)',
      transition: link && !isPro ? 'transform 0.2s, box-shadow 0.2s' : 'none',
      cursor: link ? 'pointer' : 'default',
      position: 'relative',
      textDecoration: 'none',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '180px',
      opacity: isPro ? 0.6 : 1
    }}
    onMouseEnter={(e) => {
      if (link && !isPro) {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
      }
    }}
    onMouseLeave={(e) => {
      if (link && !isPro) {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'
      }
    }}>
      {isPro && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '4px 10px',
          backgroundColor: '#FF9500',
          color: 'white',
          borderRadius: '10px',
          fontSize: '10px',
          fontWeight: '700'
        }}>
          PRO
        </div>
      )}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }}>
        {icon && (
          <div style={{ fontSize: '24px', opacity: isPro ? 0.5 : 1 }}>
            {icon}
          </div>
        )}
        <div style={{ 
          fontSize: '12px', 
          color: '#86868b', 
          textTransform: 'uppercase', 
          fontWeight: '600',
          letterSpacing: '0.08em'
        }}>
          {label}
        </div>
      </div>
      <div style={{ 
        fontSize: '42px', 
        fontWeight: '700',
        color: isPro ? '#86868b' : (color || '#1d1d1f'),
        marginBottom: '8px',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        flex: '1 0 auto'
      }}>
        {value}<span style={{ fontSize: '24px', fontWeight: '600', marginLeft: '4px' }}>{unit}</span>
      </div>
      <div style={{ fontSize: '14px', color: '#6e6e73', fontWeight: '500', marginTop: 'auto' }}>
        {sublabel}
      </div>
    </div>
  )

  if (link) {
    return <a href={link} style={{ textDecoration: 'none', gridColumn: gridColumn || 'auto', display: 'block', height: '100%' }}>{content}</a>
  } else {
    return <div style={{ gridColumn: gridColumn || 'auto', display: 'block', height: '100%' }}>{content}</div>
  }
}

function ActionCard({ icon, title, description, link, linkText }) {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '28px', 
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid #e8e8ed'
    }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        color: '#1d1d1f', 
        margin: '0 0 8px 0' 
      }}>
        {title}
      </h3>
      <p style={{ 
        fontSize: '15px', 
        color: '#6e6e73', 
        margin: '0 0 20px 0',
        lineHeight: 1.5
      }}>
        {description}
      </p>
      <a href={link} style={{
        display: 'inline-block',
        color: '#007AFF',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '600'
      }}>
        {linkText} →
      </a>
    </div>
  )
}
