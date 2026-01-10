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

export default function Upgrade() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.title = 'Burnout IQ - Upgrade to Pro'
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
      if (profile.is_pro) {
        setMessage('You already have Pro!')
      }
    }

    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('burnoutiQ_user_id')
    router.push('/login')
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    setMessage('')

    try {
      // In a real implementation, you would integrate with a payment provider here
      // For now, we'll just update the user's pro status
      const { error } = await supabase
        .from('users')
        .update({ is_pro: true })
        .eq('id', userId)

      if (error) {
        setMessage(`Error: ${error.message}`)
        console.error(error)
      } else {
        setMessage('✓ Successfully upgraded to Pro!')
        setUserProfile(prev => ({ ...prev, is_pro: true }))
        setTimeout(() => {
          router.push('/hours')
        }, 2000)
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`)
      console.error(err)
    }

    setUpgrading(false)
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
                          {userProfile.is_pro && (
                            <span style={{ marginLeft: '8px', padding: '2px 8px', backgroundColor: '#4F46E5', color: 'white', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>
                              PRO
                            </span>
                          )}
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
        maxWidth: '800px', 
        margin: '0 auto',
        padding: '60px 40px'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <h1 style={{ 
            fontSize: '48px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            color: '#1d1d1f',
            letterSpacing: '-0.02em'
          }}>
            Upgrade to Pro
          </h1>
          <p style={{ 
            fontSize: '19px',
            color: '#6e6e73',
            margin: 0
          }}>
            Unlock comprehensive burnout risk assessment and advanced comparative analytics
          </p>
        </div>

        {/* Pricing Card */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '72px', fontWeight: '700', color: '#4F46E5', marginBottom: '8px' }}>
            £1.99
          </div>
          <div style={{ fontSize: '19px', color: '#6e6e73', marginBottom: '40px' }}>
            per month
          </div>

          <div style={{ textAlign: 'left', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', marginBottom: '20px' }}>
              What's included:
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Comprehensive burnout risk scoring',
                'Weekly workload average tracking',
                'Circadian Disruption Index',
                'Recovery window status monitoring',
                'Advanced comparative analytics',
                'Percentile breakdowns (P25/P50/P75)',
                'Firm-specific comparisons',
                'Personalized recommendations',
                'Science-backed insights'
              ].map((feature, index) => (
                <li key={index} style={{
                  padding: '12px 0',
                  fontSize: '16px',
                  color: '#1d1d1f',
                  borderTop: index === 0 ? 'none' : '1px solid #f5f5f7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
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

          {userProfile?.is_pro ? (
            <div style={{
              padding: '20px',
              backgroundColor: '#f5f5f7',
              borderRadius: '12px',
              color: '#6e6e73'
            }}>
              You already have Pro access!
            </div>
          ) : (
            <button 
              onClick={handleUpgrade}
              disabled={upgrading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: upgrading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 0.2s',
                opacity: upgrading ? 0.6 : 1
              }}
              onMouseEnter={(e) => !upgrading && (e.currentTarget.style.backgroundColor = '#0051D5')}
              onMouseLeave={(e) => !upgrading && (e.currentTarget.style.backgroundColor = '#007AFF')}
            >
              {upgrading ? 'Processing...' : 'Upgrade to Pro - £1.99/month'}
            </button>
          )}
        </div>

        {/* Note */}
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f7',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#6e6e73',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0 }}>
            <strong>Note:</strong> This is a demo implementation. In production, you would integrate with a payment provider (Stripe, PayPal, etc.) to handle subscriptions securely.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}

