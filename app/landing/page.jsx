"use client"

import { useState } from 'react'

export default function Landing() {
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
        padding: '20px 40px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>
            Burnout <span style={{ color: '#06B6D4', fontWeight: '800' }}>IQ</span>
          </div>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="#features" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '15px' }}>Features</a>
            <a href="#pricing" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '15px' }}>Pricing</a>
            <a href="/login" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '15px' }}>Sign In</a>
            <a href="/signup" style={{
              padding: '10px 20px',
              backgroundColor: '#FF6B6B',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '20px',
              fontSize: '15px',
              fontWeight: '600'
            }}>
              Get Started Free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4F46E5 0%, #1a1a2e 50%, #FF6B6B 100%)',
        padding: '100px 40px 60px'
      }}>
        <div style={{ maxWidth: '1000px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '72px',
            fontWeight: '700',
            color: '#fff',
            margin: '0 0 24px 0',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            Balance Your Hours.<br/>Track Your Health.
          </h1>
          <p style={{
            fontSize: '24px',
            color: 'rgba(255,255,255,0.7)',
            margin: '0 0 40px 0',
            lineHeight: 1.6
          }}>
            Built for high-intensity professionals. Monitor work intensity, compare with peers, and maintain sustainable performance across banking, PE, consulting, tech, and more.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <a href="/signup" style={{
              padding: '16px 32px',
              backgroundColor: '#FF6B6B',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontSize: '17px',
              fontWeight: '600',
              boxShadow: '0 8px 24px rgba(255,107,107,0.4)'
            }}>
              Start Free Trial
            </a>
            <a href="#features" style={{
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
        backgroundColor: 'rgba(255,107,107,0.1)',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: 'rgba(255,107,107,0.2)',
              borderRadius: '20px',
              marginBottom: '20px'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#FF6B6B',
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
            backgroundColor: 'rgba(255,107,107,0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(255,107,107,0.3)'
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
              backgroundColor: '#FF6B6B',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontSize: '17px',
              fontWeight: '600',
              boxShadow: '0 8px 24px rgba(255,107,107,0.4)'
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
          backgroundColor: '#FF6B6B',
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
      border: '1px solid rgba(255,107,107,0.2)',
      position: 'relative'
    }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#fff', marginBottom: '12px' }}>{title}</h3>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{description}</p>
    </div>
  )
}

function PricingCard({ title, price, period, features, cta, ctaLink, highlighted }) {
  return (
    <div style={{
      backgroundColor: highlighted ? 'rgba(255,107,107,0.1)' : 'rgba(255,255,255,0.05)',
      padding: '40px',
      borderRadius: '16px',
      border: highlighted ? '2px solid #FF6B6B' : '1px solid rgba(255,255,255,0.1)',
      position: 'relative'
    }}>
      {highlighted && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '4px 16px',
          backgroundColor: '#FF6B6B',
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
        backgroundColor: highlighted ? '#FF6B6B' : 'rgba(255,255,255,0.1)',
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