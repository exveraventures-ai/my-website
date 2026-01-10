"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '../components/Footer'

export default function Compare() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [cohortStats, setCohortStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    document.title = 'Burnout IQ - Comparisons'
    loadUserData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('burnoutiQ_user_id')
    router.push('/login')
  }

  const loadUserData = async () => {
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
        // Check if user is approved
        if (!profile.is_approved && !profile.is_admin) {
          await supabase.auth.signOut()
          router.push('/login?message=pending')
          return
        }
        
        setUserProfile(profile)
      }
    }

    // Calculate user's stats
    const { data: logs } = await supabase
      .from('Work_Logs')
      .select('*')
      .eq('user_id', storedUserId)
      .order('Date', { ascending: false })

    if (logs && logs.length > 0) {
      const today = new Date()
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(today.getDate() - 7)
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)

      // L7D
      const last7Days = logs.filter(log => new Date(log.Date) >= sevenDaysAgo)
      const l7dTotal = last7Days.reduce((sum, log) => sum + (log.hours || 0), 0)

      // L30D
      const last30Days = logs.filter(log => new Date(log.Date) >= thirtyDaysAgo)
      const l30dTotal = last30Days.reduce((sum, log) => sum + (log.hours || 0), 0)
      const l30dAvgWeekly = last30Days.length > 0 ? (l30dTotal / last30Days.length * 7) : 0

      // All time
      const allTimeTotal = logs.reduce((sum, log) => sum + (log.hours || 0), 0)
      const allTimeAvgWeekly = logs.length > 0 ? (allTimeTotal / logs.length * 7) : 0

      setUserStats({
        l7dTotal,
        l30dAvgWeekly,
        allTimeAvgWeekly
      })
    }

    // Fetch cohort stats
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', storedUserId)
      .single()

    if (profile) {
      // Use position + region cohort for all users
      // Display is simplified for non-pro users (average only, no percentiles)
      const cohortKey = `${profile.position}_${profile.region}`
      
      const { data: cohort } = await supabase
        .from('cohort_stats')
        .select('*')
        .eq('cohort_key', cohortKey)
        .single()
      
      if (cohort) {
        setCohortStats(cohort)
      }
    }

    setLoading(false)
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
            <a href="/hours" onClick={() => setShowProfileMenu(false)} style={navLinkStyle}>Working Hours</a>
            <a href="/health" onClick={() => setShowProfileMenu(false)} style={navLinkStyle}>Health Stats</a>
            <a href="/compare" onClick={() => setShowProfileMenu(false)} style={{...navLinkStyle, fontWeight: '600', color: '#4F46E5'}}>Comparisons</a>
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
            Peer Comparisons
          </h1>
          <p style={{ 
            fontSize: '24px',
            color: '#6e6e73',
            fontWeight: '400',
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em'
          }}>
            See how you compare with your cohort
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

        {/* Comparison Content */}
        {!cohortStats ? (
          <div style={{
            backgroundColor: 'white',
            padding: '60px 40px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>📊</div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: '#1d1d1f'
            }}>
              Not Enough Data Yet
            </h2>
            <p style={{
              fontSize: '17px',
              color: '#6e6e73',
              maxWidth: '600px',
              margin: '0 auto 32px auto',
              lineHeight: 1.6
            }}>
              We need more users in your cohort ({userProfile?.position}s in {userProfile?.region}) 
              to provide meaningful comparisons. Check back soon!
            </p>
            <a href="/hours" style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#4F46E5',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              Track Your Hours
            </a>
          </div>
        ) : (
          <>
            {/* Cohort Overview */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '16px',
              marginBottom: '40px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: '2px solid #4F46E5'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                margin: '0 0 24px 0',
                color: '#1d1d1f'
              }}>
                Your Cohort
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#86868b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.06em' }}>
                    Position
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1d1d1f' }}>
                    {userProfile?.position}
                  </div>
                </div>
                {userProfile?.is_pro && (
                  <div>
                    <div style={{ fontSize: '13px', color: '#86868b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.06em' }}>
                      Region
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1d1d1f' }}>
                      {userProfile?.region}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '13px', color: '#86868b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.06em' }}>
                    Cohort Size
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1d1d1f' }}>
                    {cohortStats.user_count} users
                  </div>
                </div>
              </div>
            </div>

            {/* Firm-Specific Comparison - Pro Feature */}
            {!userProfile?.is_pro && (
              <div style={{
                backgroundColor: '#f5f5f7',
                padding: '40px',
                borderRadius: '16px',
                marginBottom: '40px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                border: '2px solid #d2d2d7',
                position: 'relative',
                opacity: 0.6,
                filter: 'grayscale(30%)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '6px 14px',
                  backgroundColor: '#FF9500',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  PRO
                </div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  margin: '0 0 12px 0',
                  color: '#86868b'
                }}>
                  Firm-Specific Comparisons
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#6e6e73',
                  margin: '0 0 24px 0',
                  lineHeight: 1.5
                }}>
                  Compare your hours against specific firms and firm types across different sectors and regions
                </p>
                <a href="/upgrade" style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600'
                }}>
                  Upgrade to Pro - £1.99/month
                </a>
              </div>
            )}

            {/* Comparison Stats */}
            {userStats && (
              <>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  margin: '0 0 24px 0',
                  color: '#1d1d1f'
                }}>
                  Weekly Hours Comparison
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '50px' }}>
                  <ComparisonCard
                    title="L7D Total"
                    yourValue={userStats.l7dTotal.toFixed(1)}
                    cohortAverage={cohortStats.median_weekly_hours.toFixed(1)}
                    cohortMedian={userProfile?.is_pro ? cohortStats.median_weekly_hours.toFixed(1) : null}
                    cohortP25={userProfile?.is_pro ? cohortStats.p25_weekly_hours.toFixed(1) : null}
                    cohortP75={userProfile?.is_pro ? cohortStats.p75_weekly_hours.toFixed(1) : null}
                    unit="hrs"
                    isPro={userProfile?.is_pro || false}
                  />
                  <ComparisonCard
                    title="L30D Weekly Average"
                    yourValue={userStats.l30dAvgWeekly.toFixed(1)}
                    cohortAverage={cohortStats.median_weekly_hours.toFixed(1)}
                    cohortMedian={userProfile?.is_pro ? cohortStats.median_weekly_hours.toFixed(1) : null}
                    cohortP25={userProfile?.is_pro ? cohortStats.p25_weekly_hours.toFixed(1) : null}
                    cohortP75={userProfile?.is_pro ? cohortStats.p75_weekly_hours.toFixed(1) : null}
                    unit="hrs/week"
                    isPro={userProfile?.is_pro || false}
                  />
                  <ComparisonCard
                    title="All-Time Weekly Average"
                    yourValue={userStats.allTimeAvgWeekly.toFixed(1)}
                    cohortAverage={cohortStats.median_weekly_hours.toFixed(1)}
                    cohortMedian={userProfile?.is_pro ? cohortStats.median_weekly_hours.toFixed(1) : null}
                    cohortP25={userProfile?.is_pro ? cohortStats.p25_weekly_hours.toFixed(1) : null}
                    cohortP75={userProfile?.is_pro ? cohortStats.p75_weekly_hours.toFixed(1) : null}
                    unit="hrs/week"
                    isPro={userProfile?.is_pro || false}
                  />
                </div>

                {/* Interpretation Guide - Only show for Pro users */}
                {userProfile?.is_pro && (
                  <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                  }}>
                    <h2 style={{
                      fontSize: '24px',
                      fontWeight: '600',
                      margin: '0 0 24px 0',
                      color: '#1d1d1f'
                    }}>
                      Understanding Your Comparison
                    </h2>
                    <div style={{ display: 'grid', gap: '20px' }}>
                      <InterpretationRow
                        icon="📊"
                        label="Median (P50)"
                        description="The middle value - 50% of your cohort works more, 50% works less"
                      />
                      <InterpretationRow
                        icon="📉"
                        label="25th Percentile (P25)"
                        description="75% of your cohort works more than this value"
                      />
                      <InterpretationRow
                        icon="📈"
                        label="75th Percentile (P75)"
                        description="Only 25% of your cohort works more than this value"
                      />
                      <InterpretationRow
                        icon="🎯"
                        label="Your Position"
                        description="Compare your hours to these benchmarks to understand your relative workload"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Privacy Note */}
        <div style={{
          marginTop: '40px',
          padding: '30px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 12px 0',
            color: '#1d1d1f'
          }}>
            🔒 Privacy & Anonymity
          </h3>
          <p style={{
            fontSize: '15px',
            color: '#6e6e73',
            lineHeight: 1.6,
            margin: 0
          }}>
            All comparison data is anonymized and aggregated. Individual user data is never shared. 
            Statistics are only shown when there are at least 5 users in a cohort to ensure anonymity.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function ComparisonCard({ title, yourValue, cohortAverage, cohortMedian, cohortP25, cohortP75, unit, isPro }) {
  const yourNum = parseFloat(yourValue)
  const averageNum = parseFloat(cohortAverage)
  const percentDiff = ((yourNum - averageNum) / averageNum * 100).toFixed(0)
  
  let status = 'On par with average'
  let statusColor = '#06B6D4'
  
  if (isPro && cohortP25 && cohortP75 && cohortMedian) {
    const medianNum = parseFloat(cohortMedian)
    if (yourNum > parseFloat(cohortP75)) {
      status = 'Above 75th percentile'
      statusColor = '#FF3B30'
    } else if (yourNum > medianNum) {
      status = 'Above median'
      statusColor = '#FF9500'
    } else if (yourNum < parseFloat(cohortP25)) {
      status = 'Below 25th percentile'
      statusColor = '#4F46E5'
    } else if (yourNum < medianNum) {
      status = 'Below median'
      statusColor = '#4F46E5'
    }
  } else {
    // Non-pro: simple comparison against average
    if (yourNum > averageNum * 1.1) {
      status = 'Above average'
      statusColor = '#FF9500'
    } else if (yourNum < averageNum * 0.9) {
      status = 'Below average'
      statusColor = '#4F46E5'
    }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '32px',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      border: '1px solid #e8e8ed'
    }}>
      <h3 style={{
        fontSize: '15px',
        color: '#86868b',
        margin: '0 0 20px 0',
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: '0.06em'
      }}>
        {title}
      </h3>
      
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: '#86868b', marginBottom: '8px' }}>Your Hours</div>
        <div style={{ fontSize: '48px', fontWeight: '700', color: '#1d1d1f', lineHeight: 1 }}>
          {yourValue}<span style={{ fontSize: '20px', fontWeight: '600', color: '#6e6e73', marginLeft: '4px' }}>{unit}</span>
        </div>
        <div style={{ 
          fontSize: '15px', 
          fontWeight: '600', 
          color: statusColor,
          marginTop: '8px'
        }}>
          {percentDiff > 0 ? '+' : ''}{percentDiff}% vs {isPro ? 'median' : 'average'}
        </div>
      </div>

      {isPro && cohortP25 && cohortMedian && cohortP75 ? (
        <>
          <div style={{ 
            paddingTop: '20px', 
            borderTop: '1px solid #e8e8ed',
            display: 'grid',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#6e6e73' }}>25th Percentile</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1d1d1f' }}>{cohortP25} {unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#6e6e73' }}>Median (P50)</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1d1d1f' }}>{cohortMedian} {unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#6e6e73' }}>75th Percentile</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1d1d1f' }}>{cohortP75} {unit}</span>
            </div>
          </div>
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            backgroundColor: '#f5f5f7',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#6e6e73',
            fontWeight: '500'
          }}>
            {status}
          </div>
        </>
      ) : (
        <>
          <div style={{ 
            paddingTop: '20px', 
            borderTop: '1px solid #e8e8ed',
            paddingBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#6e6e73' }}>Cohort Average</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1d1d1f' }}>{cohortAverage} {unit}</span>
            </div>
          </div>
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            backgroundColor: '#f5f5f7',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#6e6e73',
            fontWeight: '500'
          }}>
            {status}
          </div>
          <div style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#fff3e0',
            borderRadius: '10px',
            border: '1px solid #ffb74d',
            fontSize: '13px',
            color: '#6e6e73',
            lineHeight: '1.5'
          }}>
            <div style={{ fontWeight: '600', color: '#1d1d1f', marginBottom: '4px' }}>
              🔒 Pro Feature Available
            </div>
            <div style={{ marginBottom: '8px' }}>
              Upgrade to see percentile breakdowns (P25, Median, P75) and detailed comparisons.
            </div>
            <a href="/upgrade" style={{
              color: '#4F46E5',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '13px'
            }}>
              Upgrade to Pro →
            </a>
          </div>
        </>
      )}
    </div>
  )
}

function InterpretationRow({ icon, label, description }) {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <div style={{ fontSize: '32px', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '15px', color: '#6e6e73', lineHeight: 1.5 }}>
          {description}
        </div>
      </div>
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