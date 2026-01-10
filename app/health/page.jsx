"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '../components/Footer'

export default function Health() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    document.title = 'Burnout IQ - Health Stats'
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
            <a href="/health" onClick={() => setShowProfileMenu(false)} style={{...navLinkStyle, fontWeight: '600', color: '#4F46E5'}}>Health Stats</a>
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
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
            backgroundColor: '#6e6e73',
            color: 'white',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            marginBottom: '24px'
          }}>
            COMING SOON
          </div>
          <h1 style={{ 
            fontSize: '64px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            color: '#1d1d1f',
            letterSpacing: '-0.03em'
          }}>
            Health Stats
          </h1>
          <p style={{ 
            fontSize: '24px',
            color: '#6e6e73',
            fontWeight: '400',
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em'
          }}>
            Track HRV, RHR, and sleep alongside your work hours
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

        {/* Coming Soon Banner */}
        <div style={{
          backgroundColor: 'white',
          padding: '60px 40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          marginBottom: '50px'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>💪</div>
          <h2 style={{
            fontSize: '40px',
            fontWeight: '700',
            margin: '0 0 20px 0',
            color: '#1d1d1f',
            letterSpacing: '-0.02em'
          }}>
            Coming Soon
          </h2>
          <p style={{
            fontSize: '19px',
            color: '#6e6e73',
            maxWidth: '700px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6
          }}>
            We're building a comprehensive health tracking system to help you monitor how your work 
            hours impact your physical wellbeing. Track key metrics and get actionable insights.
          </p>
          <a href="/hours" style={{
            display: 'inline-block',
            padding: '16px 40px',
            backgroundColor: '#4F46E5',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '17px'
          }}>
            Track Work Hours Instead
          </a>
        </div>

        {/* Planned Features */}
        <h2 style={{
          fontSize: '32px',
          fontWeight: '600',
          margin: '0 0 32px 0',
          color: '#1d1d1f',
          textAlign: 'center'
        }}>
          What's Coming
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '50px'
        }}>
          <FeatureCard
            icon="❤️"
            title="Heart Rate Variability (HRV)"
            description="Track your HRV to measure recovery and stress levels. See how intense work weeks impact your autonomic nervous system."
            features={[
              'Daily HRV tracking',
              'Trend analysis over time',
              'Correlation with work hours',
              'Recovery recommendations'
            ]}
          />
          <FeatureCard
            icon="💓"
            title="Resting Heart Rate (RHR)"
            description="Monitor your baseline heart rate as an indicator of cardiovascular fitness and stress."
            features={[
              'Morning RHR logging',
              'Weekly averages',
              'Alert for unusual spikes',
              'Fitness trend tracking'
            ]}
          />
          <FeatureCard
            icon="😴"
            title="Sleep Quality & Duration"
            description="Log your sleep to understand how work hours affect your rest and recovery."
            features={[
              'Sleep duration tracking',
              'Quality ratings',
              'Sleep debt calculation',
              'Work-sleep balance insights'
            ]}
          />
        </div>

        {/* Health-Work Correlation */}
        <div style={{
          backgroundColor: 'white',
          padding: '50px',
          borderRadius: '20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          marginBottom: '50px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '600',
            margin: '0 0 24px 0',
            color: '#1d1d1f'
          }}>
            Work-Health Insights
          </h2>
          <p style={{
            fontSize: '17px',
            color: '#6e6e73',
            marginBottom: '32px',
            lineHeight: 1.6
          }}>
            Once launched, you'll be able to:
          </p>
          <div style={{ display: 'grid', gap: '20px' }}>
            <InsightRow
              icon="📊"
              text="See correlations between long work weeks and HRV drops"
            />
            <InsightRow
              icon="⚠️"
              text="Get alerts when health metrics suggest you need recovery time"
            />
            <InsightRow
              icon="📈"
              text="Track how consistent sleep improves your work performance"
            />
            <InsightRow
              icon="🎯"
              text="Set health goals and monitor progress alongside work targets"
            />
            <InsightRow
              icon="👥"
              text="Compare your health metrics with peers (anonymized)"
            />
          </div>
        </div>

        {/* Integration Preview */}
        <div style={{
          backgroundColor: 'white',
          padding: '50px',
          borderRadius: '20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '600',
            margin: '0 0 24px 0',
            color: '#1d1d1f'
          }}>
            Device Integrations (Planned)
          </h2>
          <p style={{
            fontSize: '17px',
            color: '#6e6e73',
            marginBottom: '32px',
            lineHeight: 1.6
          }}>
            We're planning integrations with popular health tracking devices:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '20px'
          }}>
            <DeviceCard name="Apple Watch" emoji="⌚" />
            <DeviceCard name="Whoop" emoji="💪" />
            <DeviceCard name="Oura Ring" emoji="💍" />
            <DeviceCard name="Garmin" emoji="🏃" />
            <DeviceCard name="Fitbit" emoji="📱" />
            <DeviceCard name="Manual Entry" emoji="✍️" />
          </div>
        </div>

        {/* Notify Me CTA */}
        <div style={{
          marginTop: '50px',
          padding: '50px',
          backgroundColor: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
          background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
          borderRadius: '20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em'
          }}>
            Want Early Access?
          </h2>
          <p style={{
            fontSize: '19px',
            margin: '0 0 32px 0',
            opacity: 0.95
          }}>
            We'll notify you when health tracking launches
          </p>
          <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <input
              type="email"
              placeholder="your.email@company.com"
              disabled
              style={{
                flex: '1 1 250px',
                padding: '16px 20px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontFamily: 'inherit',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
            />
            <button
              disabled
              style={{
                padding: '16px 32px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'not-allowed',
                fontFamily: 'inherit',
                opacity: 0.6
              }}
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function FeatureCard({ icon, title, description, features }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      border: '1px solid #e8e8ed'
    }}>
      <div style={{ fontSize: '56px', marginBottom: '20px' }}>{icon}</div>
      <h3 style={{
        fontSize: '24px',
        fontWeight: '600',
        margin: '0 0 12px 0',
        color: '#1d1d1f'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '15px',
        color: '#6e6e73',
        marginBottom: '24px',
        lineHeight: 1.6
      }}>
        {description}
      </p>
      <div style={{
        paddingTop: '20px',
        borderTop: '1px solid #e8e8ed'
      }}>
        {features.map((feature, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
            fontSize: '14px',
            color: '#6e6e73'
          }}>
            <span style={{ color: '#06B6D4', fontSize: '16px' }}>✓</span>
            {feature}
          </div>
        ))}
      </div>
    </div>
  )
}

function InsightRow({ icon, text }) {
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: '#f5f5f7',
      borderRadius: '12px'
    }}>
      <div style={{ fontSize: '28px', flexShrink: 0 }}>{icon}</div>
      <div style={{ fontSize: '16px', color: '#1d1d1f', fontWeight: '500' }}>
        {text}
      </div>
    </div>
  )
}

function DeviceCard({ name, emoji }) {
  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f5f5f7',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{emoji}</div>
      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>
        {name}
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