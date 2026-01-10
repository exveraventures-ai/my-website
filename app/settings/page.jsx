"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '../components/Footer'

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
  boxShadow: '0 2px 8px rgba(0,122,255,0.2)'
}

const cancelButtonStyle = {
  padding: '12px 28px', 
  backgroundColor: '#6e6e73', 
  color: 'white', 
  border: 'none', 
  borderRadius: '10px', 
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '16px',
  fontFamily: 'inherit',
  transition: 'background-color 0.2s',
  marginLeft: '12px'
}

export default function Settings() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    default_start_time: '09:30',
    default_end_time: '21:30',
    weekly_target_hours: 40
  })

  useEffect(() => {
    document.title = 'Burnout IQ - Settings'
    checkUserAndFetch()
  }, [])

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
      } else {
        router.push('/profile')
        return
      }
    } else {
      setUserId(storedUserId)
    }

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
      setFormData({
        default_start_time: profile.default_start_time || '09:30',
        default_end_time: profile.default_end_time || '21:30',
        weekly_target_hours: profile.weekly_target_hours || 40
      })
    }

    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('burnoutiQ_user_id')
    router.push('/login')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          default_start_time: formData.default_start_time,
          default_end_time: formData.default_end_time,
          weekly_target_hours: parseFloat(formData.weekly_target_hours)
        })
        .eq('id', userId)

      if (error) {
        setMessage(`Error: ${error.message}`)
        console.error(error)
      } else {
        setMessage('✓ Settings saved successfully')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`)
      console.error(err)
    }

    setSaving(false)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
            <a href="/dashboard" onClick={() => setShowProfileMenu(false)} style={navLinkStyle}>Dashboard</a>
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
                        transition: 'background-color 0.2s',
                        backgroundColor: '#f5f5f7'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8e8ed'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
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
                          textAlign: 'left'
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
        maxWidth: '800px', 
        margin: '0 auto',
        padding: '60px 40px'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '40px'
        }}>
          <h1 style={{ 
            fontSize: '48px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            color: '#1d1d1f',
            letterSpacing: '-0.02em'
          }}>
            Settings
          </h1>
          <p style={{ 
            fontSize: '19px',
            color: '#6e6e73',
            margin: 0
          }}>
            Customize your default preferences for logging hours and tracking goals
          </p>
        </div>

        {/* Settings Form */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          marginBottom: '30px'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '32px' }}>
              <label style={labelStyle}>Default Start Time</label>
              <input
                type="time"
                value={formData.default_start_time}
                onChange={(e) => handleChange('default_start_time', e.target.value)}
                required
                step="60"
                style={inputStyle}
              />
              <p style={{ 
                fontSize: '13px', 
                color: '#86868b', 
                margin: '8px 0 0 0' 
              }}>
                This will be the default start time when logging new hours
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={labelStyle}>Default End Time</label>
              <input
                type="time"
                value={formData.default_end_time}
                onChange={(e) => handleChange('default_end_time', e.target.value)}
                required
                step="60"
                style={inputStyle}
              />
              <p style={{ 
                fontSize: '13px', 
                color: '#86868b', 
                margin: '8px 0 0 0' 
              }}>
                This will be the default end time when logging new hours
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={labelStyle}>Weekly Target Hours</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.weekly_target_hours}
                onChange={(e) => handleChange('weekly_target_hours', e.target.value)}
                required
                style={inputStyle}
              />
              <p style={{ 
                fontSize: '13px', 
                color: '#86868b', 
                margin: '8px 0 0 0' 
              }}>
                Your weekly goal for working hours (used for progress tracking and projections)
              </p>
            </div>

            {message && (
              <p style={{ 
                marginBottom: '24px',
                color: message.includes('Error') ? '#FF3B30' : '#06B6D4',
                fontWeight: '500',
                fontSize: '15px'
              }}>
                {message}
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="submit" 
                style={buttonStyle}
                disabled={saving}
                onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#0051D5')}
                onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = '#4F46E5')}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}

