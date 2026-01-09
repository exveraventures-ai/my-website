"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    document.title = 'Burnout IQ - Track Your Working Hours'
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #FF6B6B 100%)',
        padding: '120px 40px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '72px',
          fontWeight: '700',
          margin: '0 0 24px 0',
          letterSpacing: '-0.03em'
        }}>
          Burnout <span style={{ color: '#06B6D4', fontWeight: '800' }}>IQ</span>
        </h1>
        <p style={{
          fontSize: '28px',
          margin: '0 0 48px 0',
          opacity: 0.95,
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.4
        }}>
          Track your working hours, analyze burnout risk with comprehensive metrics, maintain work-life balance, and compare with peers in finance
        </p>
        <a 
          href="/login"
          style={{
            display: 'inline-block',
            padding: '18px 48px',
            backgroundColor: 'white',
            color: '#4F46E5',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '19px',
            fontWeight: '600',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Get Started
        </a>
      </div>

      {/* Features Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 40px'
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '700',
          textAlign: 'center',
          margin: '0 0 60px 0',
          color: '#1d1d1f',
          letterSpacing: '-0.02em'
        }}>
          Everything you need
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px'
        }}>
          <FeatureCard 
            icon="⏱️"
            title="Track Hours"
            description="Log your daily work hours including overnight shifts. Edit historical entries anytime."
          />
          <FeatureCard 
            icon="📊"
            title="Smart Analytics"
            description="View rolling averages, workload intensity, and weekly projections based on your patterns. Track 7-day and 30-day trends with intensity ratios that compare recent activity to your historical baseline."
          />
          <FeatureCard 
            icon="👥"
            title="Peer Comparisons"
            description="Compare your hours with analysts, associates, and VPs at similar firms in your region."
          />
          <FeatureCard 
            icon="🔥"
            title="Streak Tracking"
            description="Build momentum with consecutive day tracking and intensity monitoring."
          />
          <FeatureCard 
            icon="⚠️"
            title="Burnout Risk Analysis"
            description="Comprehensive burnout risk scoring that factors in weekly averages, late-night work hours (10 PM-6 AM), and weekend protection. Get alerts for CRITICAL, HIGH RISK, ELEVATED, or SUSTAINABLE status based on your workload patterns and recovery time."
          />
          <FeatureCard 
            icon="🔒"
            title="Private & Secure"
            description="Your data is encrypted and private. Compare anonymously with your cohort."
          />
          <FeatureCard 
            icon="💪"
            title="Advanced Features"
            description="Advanced features to come. Work in progress."
            disabled={true}
          />
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        backgroundColor: '#1d1d1f',
        padding: '80px 40px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '700',
          margin: '0 0 24px 0',
          letterSpacing: '-0.02em'
        }}>
          Ready to get started?
        </h2>
        <p style={{
          fontSize: '21px',
          margin: '0 0 40px 0',
          opacity: 0.9
        }}>
          Join professionals tracking their hours sustainably
        </p>
        <a 
          href="/login"
          style={{
            display: 'inline-block',
            padding: '18px 48px',
            backgroundColor: '#FF6B6B',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '19px',
            fontWeight: '600',
            boxShadow: '0 8px 24px rgba(255,107,107,0.4)'
          }}
        >
          Sign Up Free
        </a>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, disabled }) {
  return (
    <div style={{
      backgroundColor: disabled ? '#f5f5f7' : 'white',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: disabled ? '0 2px 10px rgba(0,0,0,0.03)' : '0 4px 20px rgba(0,0,0,0.06)',
      transition: disabled ? 'none' : 'transform 0.2s, box-shadow 0.2s',
      opacity: disabled ? 0.6 : 1
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'
      }
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px', opacity: disabled ? 0.5 : 1 }}>{icon}</div>
      <h3 style={{
        fontSize: '24px',
        fontWeight: '600',
        margin: '0 0 12px 0',
        color: disabled ? '#86868b' : '#1d1d1f'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '16px',
        color: disabled ? '#86868b' : '#6e6e73',
        margin: 0,
        lineHeight: 1.6
      }}>
        {description}
      </p>
    </div>
  )
}