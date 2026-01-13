"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { useIsMobile } from '../lib/useMediaQuery'

export default function Landing() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (profile && (profile.is_approved || profile.is_admin)) {
        setUserProfile(profile)
        setIsAuthenticated(true)
      }
    }
  }

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#000'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        zIndex: 1000,
        padding: isMobile ? '16px 20px' : '20px 40px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#fff' }}>
            Burnout <span style={{ color: '#06B6D4', fontWeight: '800' }}>IQ</span>
          </div>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
              <a href="#features" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '15px' }}>Features</a>
              <a href="#preview" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '15px' }}>Preview</a>
              <a href="#pricing" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '15px' }}>Pricing</a>
              {isAuthenticated ? (
                <>
                  <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '15px' }}>Dashboard</a>
                  <a href="/hours" style={{
                    padding: '10px 20px',
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '20px',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}>
                    Track Hours
                  </a>
                </>
              ) : (
                <>
                  <a href="/login" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '15px' }}>Sign In</a>
                  <a href="/request-access" style={{
                    padding: '10px 20px',
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '20px',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}>
                    Request Access
                  </a>
                </>
              )}
            </div>
          )}

          {/* Mobile Hamburger Menu */}
          {isMobile && (
            <>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '44px',
                  minHeight: '44px'
                }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
              
              {/* Mobile Menu Dropdown */}
              {mobileMenuOpen && (
                <>
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      zIndex: 999
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.95)',
                    borderRadius: '12px',
                    padding: '20px',
                    minWidth: '200px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <a
                      href="#features"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        fontSize: '16px',
                        padding: '12px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      Features
                    </a>
                    <a
                      href="#preview"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        fontSize: '16px',
                        padding: '12px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      Preview
                    </a>
                    <a
                      href="#pricing"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        fontSize: '16px',
                        padding: '12px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      Pricing
                    </a>
                    {isAuthenticated ? (
                      <>
                        <a
                          href="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          style={{
                            display: 'block',
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'none',
                            fontSize: '16px',
                            padding: '12px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          Dashboard
                        </a>
                        <a
                          href="/hours"
                          onClick={() => setMobileMenuOpen(false)}
                          style={{
                            display: 'block',
                            backgroundColor: '#4F46E5',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '16px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            marginTop: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Track Hours
                        </a>
                      </>
                    ) : (
                      <>
                        <a
                          href="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          style={{
                            display: 'block',
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'none',
                            fontSize: '16px',
                            padding: '12px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          Sign In
                        </a>
                        <a
                          href="/request-access"
                          onClick={() => setMobileMenuOpen(false)}
                          style={{
                            display: 'block',
                            backgroundColor: '#4F46E5',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '16px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            marginTop: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Request Access
                        </a>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4F46E5 0%, #1a1a2e 50%, #06B6D4 100%)',
        padding: isMobile ? '80px 20px 40px' : '100px 40px 60px'
      }}>
        <div style={{ maxWidth: '1000px', textAlign: 'center', padding: isMobile ? '0 10px' : '0' }}>
          <h1 style={{
            fontSize: isMobile ? '36px' : '72px',
            fontWeight: '700',
            color: '#fff',
            margin: '0 0 24px 0',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            Balance Your Hours.<br/>Track Your Health.
          </h1>
          <p style={{
            fontSize: isMobile ? '18px' : '24px',
            color: 'rgba(255,255,255,0.7)',
            margin: '0 0 40px 0',
            lineHeight: 1.6
          }}>
            Built for high-intensity professionals. Monitor work intensity, compare with peers, and maintain sustainable performance across banking, PE, consulting, tech, and more.
          </p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', justifyContent: 'center', alignItems: 'stretch' }}>
            {isAuthenticated ? (
              <>
                <a href="/hours" style={{
                  padding: '16px 32px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '17px',
                  fontWeight: '600',
                  boxShadow: '0 8px 24px rgba(79,70,229,0.4)'
                }}>
                  Start Tracking Hours
                </a>
                <a href="/dashboard" style={{
                  padding: '16px 32px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '17px',
                  fontWeight: '600',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  View Dashboard
                </a>
              </>
            ) : (
              <>
                <a href="/request-access" style={{
                  padding: '16px 32px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '17px',
                  fontWeight: '600',
                  boxShadow: '0 8px 24px rgba(79,70,229,0.4)'
                }}>
                  Request Access
                </a>
                <a href="#preview" style={{
                  padding: '16px 32px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '17px',
                  fontWeight: '600',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  See How It Works
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Hours Page Preview Section */}
      <section id="preview" style={{
        padding: '100px 40px',
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '20px'
            }}>
              See It In Action
            </h2>
            <p style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Get a glimpse of what your hours tracking dashboard looks like
            </p>
          </div>

          {/* Preview Container */}
          <div style={{
            backgroundColor: '#f5f5f7',
            borderRadius: '16px',
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Mock Header */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 40px',
              borderRadius: '12px',
              marginBottom: '30px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '28px', fontWeight: '600', color: '#1d1d1f', margin: 0 }}>Working Hours</h3>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6e6e73' }}>Dashboard</span>
                <span style={{ fontSize: '14px', color: '#4F46E5', fontWeight: '600' }}>Working Hours</span>
                <span style={{ fontSize: '14px', color: '#6e6e73' }}>Health Stats</span>
              </div>
            </div>

            {/* Mock Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <StatCard label="L7D Average" value="10.2h" color="#34C759" />
              <StatCard label="Weekly Total" value="71.4h" color="#FF9500" />
              <StatCard label="Streak" value="12 days" color="#4F46E5" />
              <StatCard label="Risk Score" value="45 🟡" color="#FFD700" />
            </div>

            {/* Mock Hours Entry Form */}
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              marginBottom: '30px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', marginBottom: '20px' }}>Log Hours</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '15px' }}>
                <input placeholder="Date" style={{ padding: '12px', border: '1px solid #e8e8ed', borderRadius: '8px', fontSize: '14px' }} />
                <input placeholder="Start Time" style={{ padding: '12px', border: '1px solid #e8e8ed', borderRadius: '8px', fontSize: '14px' }} />
                <input placeholder="End Time" style={{ padding: '12px', border: '1px solid #e8e8ed', borderRadius: '8px', fontSize: '14px' }} />
                <input placeholder="Adjustment" style={{ padding: '12px', border: '1px solid #e8e8ed', borderRadius: '8px', fontSize: '14px' }} />
                <button style={{
                  padding: '12px 24px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Add Entry
                </button>
              </div>
            </div>

            {/* Mock Chart Preview */}
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', marginBottom: '20px' }}>Weekly Trend</h4>
              <div style={{
                height: '200px',
                backgroundColor: '#f5f5f7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                padding: '20px',
                gap: '10px'
              }}>
                {[45, 65, 55, 75, 80, 70, 65].map((height, idx) => (
                  <div key={idx} style={{
                    flex: 1,
                    backgroundColor: idx === 4 ? '#4F46E5' : '#06B6D4',
                    height: `${height}%`,
                    borderRadius: '4px 4px 0 0',
                    minHeight: '20px'
                  }} />
                ))}
              </div>
            </div>

            {!isAuthenticated && (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <a href="/request-access" style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '17px',
                  fontWeight: '600',
                  boxShadow: '0 8px 24px rgba(79,70,229,0.4)'
                }}>
                  Get Started - Request Access
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '100px 40px',
        backgroundColor: '#0a0a0a'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            Everything you need to stay balanced
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            <FeatureCard 
              icon="📊"
              title="Track Your Hours"
              description="Log daily work hours with smart rolling averages and intensity tracking. See L7D totals, workload ratios, and historical trends."
            />
            <FeatureCard 
              icon="📈"
              title="Peer Comparisons"
              description="Anonymously benchmark against Associates, VPs, and Partners in your region and firm type."
            />
            <FeatureCard 
              icon="🔥"
              title="Streak Tracking"
              description="Build consistency with workday streak tracking. Weekends don't count — we respect your rest."
            />
            <FeatureCard 
              icon="🌍"
              title="Regional Data"
              description="Filter by UK, Europe, US, APAC. See how hours differ across sectors like banking, PE, consulting, and tech."
            />
          </div>
        </div>
      </section>

      {/* Pro Features Section */}
      <section id="pro-features" style={{
        padding: '100px 40px',
        backgroundColor: 'rgba(79,70,229,0.1)',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: 'rgba(79,70,229,0.2)',
              borderRadius: '20px',
              marginBottom: '20px'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#4F46E5',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Pro Features
              </span>
            </div>
          </div>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            Unlock Pro Features
          </h2>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            marginBottom: '60px',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Get comprehensive burnout risk assessment and advanced comparative analytics.
          </p>

          {/* Burnout Risk Assessment */}
          <div style={{ marginBottom: '60px' }}>
            <h3 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#fff',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              Burnout Risk Assessment
            </h3>
            {/* Overall Risk Score - Full Width */}
            <div style={{ marginBottom: '30px' }}>
              <ProFeatureCard 
                icon="📊"
                title="Overall Risk Score"
                description="Get a comprehensive 0-100 burnout risk score based on your work patterns, combining workload intensity, circadian disruption, and recovery metrics."
              />
            </div>
            {/* Three cards below */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
              <ProFeatureCard 
                icon="⏱️"
                title="Weekly Workload Average"
                description="Track your rolling 4-week average hours to identify unsustainable workload patterns. See how your current intensity compares to sustainable thresholds."
              />
              <ProFeatureCard 
                icon="🌙"
                title="Circadian Disruption Index"
                description="Monitor late-night work patterns and their impact on your circadian rhythm. Understand how working past midnight affects your recovery and performance."
              />
              <ProFeatureCard 
                icon="🏖️"
                title="Recovery Window Status"
                description="Track how many weekend days you protect for recovery. Identify patterns where insufficient rest windows increase burnout risk."
              />
            </div>
          </div>

          {/* Advanced Comparative Analytics */}
          <div style={{ marginBottom: '60px' }}>
            <h3 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#fff',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              Advanced Comparative Analytics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
              <ProFeatureCard 
                icon="📊"
                title="Percentile Breakdowns"
                description="See where you stand with detailed percentile analysis (P25, Median, P75). Understand your position within your cohort with precision."
              />
              <ProFeatureCard 
                icon="🏢"
                title="Firm-Specific Comparisons"
                description="Compare your hours against specific firms and firm types. See how your workload compares to peers across different sectors and companies."
              />
              <ProFeatureCard 
                icon="📍"
                title="Regional Analytics & Insights"
                description="Get position and region-based cohort insights with comprehensive interpretation guides. Understand how work patterns differ across regions and make data-driven decisions."
              />
            </div>
          </div>

          {/* Single Get Started Card */}
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'rgba(79,70,229,0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(79,70,229,0.3)'
          }}>
            <h3 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '16px'
            }}>
              Get Started with Pro
            </h3>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '32px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Unlock comprehensive burnout risk analysis, advanced comparative analytics, percentile breakdowns, and firm-specific comparisons for £1.99/month.
            </p>
            <a href="/signup?plan=pro" style={{
              display: 'inline-block',
              padding: '16px 32px',
              backgroundColor: '#4F46E5',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontSize: '17px',
              fontWeight: '600',
              boxShadow: '0 8px 24px rgba(79,70,229,0.4)'
            }}>
              Start Pro Trial - £1.99/month
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '100px 40px',
        backgroundColor: '#000'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            Simple, transparent pricing
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '900px', margin: '0 auto' }}>
            <PricingCard 
              title="Free"
              price="£0"
              period="forever"
              features={[
                'Unlimited hour tracking',
                'L7D & historical averages',
                'Workload intensity ratios',
                'Streak tracking',
                'Basic peer comparisons'
              ]}
              cta="Get Started"
              ctaLink="/signup"
            />
            <PricingCard 
              title="Pro"
              price="£1.99"
              period="/month"
              features={[
                'Everything in Free',
                'Burnout Risk Assessment',
                'Overall Risk Score (0-100)',
                'Weekly Workload Analysis',
                'Circadian Disruption Index',
                'Recovery Window Status',
                'Advanced Comparative Analytics',
                'Percentile Breakdowns (P25/P50/P75)',
                'Firm-Specific Comparisons',
                'Personalized Recommendations'
              ]}
              cta="Start Free Trial"
              ctaLink="/signup?plan=pro"
              highlighted
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px',
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px'
      }}>
        <p>© 2025 Burnout IQ. Built for sustainable high performance.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, isPro, disabled }) {
  return (
    <div style={{
      backgroundColor: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
      padding: '40px',
      borderRadius: '16px',
      border: disabled ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)',
      position: 'relative',
      opacity: disabled ? 0.5 : 1
    }}>
      {isPro && !disabled && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          padding: '4px 12px',
          backgroundColor: '#4F46E5',
          color: 'white',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          PRO
        </div>
      )}
      <div style={{ fontSize: '48px', marginBottom: '20px', opacity: disabled ? 0.4 : 1 }}>{icon}</div>
      <h3 style={{ fontSize: '24px', fontWeight: '600', color: disabled ? 'rgba(255,255,255,0.4)' : '#fff', marginBottom: '12px' }}>{title}</h3>
      <p style={{ fontSize: '16px', color: disabled ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{description}</p>
    </div>
  )
}

function ProFeatureCard({ icon, title, description }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.05)',
      padding: '32px',
      borderRadius: '16px',
      border: '1px solid rgba(79,70,229,0.2)',
      position: 'relative'
    }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#fff', marginBottom: '12px' }}>{title}</h3>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{description}</p>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '12px', color: '#6e6e73', marginBottom: '8px', fontWeight: '500' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: color }}>{value}</div>
    </div>
  )
}

function PricingCard({ title, price, period, features, cta, ctaLink, highlighted }) {
  return (
    <div style={{
      backgroundColor: highlighted ? 'rgba(79,70,229,0.1)' : 'rgba(255,255,255,0.05)',
      padding: '40px',
      borderRadius: '16px',
      border: highlighted ? '2px solid #4F46E5' : '1px solid rgba(255,255,255,0.1)',
      position: 'relative'
    }}>
      {highlighted && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '4px 16px',
          backgroundColor: '#4F46E5',
          color: 'white',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          MOST POPULAR
        </div>
      )}
      <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#fff', marginBottom: '12px' }}>{title}</h3>
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '48px', fontWeight: '700', color: '#fff' }}>{price}</span>
        <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>{period}</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
        {features.map((feature, idx) => (
          <li key={idx} style={{
            padding: '12px 0',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '15px',
            borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)'
          }}>
            ✓ {feature}
          </li>
        ))}
      </ul>
      <a href={ctaLink} style={{
        display: 'block',
        padding: '14px',
        backgroundColor: highlighted ? '#4F46E5' : 'rgba(255,255,255,0.1)',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '600',
        textAlign: 'center',
        border: highlighted ? 'none' : '1px solid rgba(255,255,255,0.2)'
      }}>
        {cta}
      </a>
    </div>
  )
}