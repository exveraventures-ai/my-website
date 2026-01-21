"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { firmCategories } from '../lib/firms'
import { sendAccessRequestEmail, sendAdminNotificationEmail, initializeEmailJS } from '../lib/emailService'

export default function RequestAccess() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    position: '',
    company: '',
    firm_type: '',
    region: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    initializeEmailJS()
  }, [])

  const positions = [
    'Analyst',
    'Associate',
    'Senior Associate',
    'VP / Principal',
    'Director / Partner',
    'Managing Director'
  ]

  const regions = [
    'USA - New York',
    'USA - Boston',
    'USA - Los Angeles',
    'Europe - London',
    'Europe - Milan',
    'Europe - Paris',
    'Europe - Frankfurt',
    'Europe - Madrid'
  ]

  const groupedCompanies = firmCategories
  const firmTypeMapping = Object.entries(firmCategories).reduce((acc, [category, firms]) => {
    firms.forEach(firm => {
      acc[firm] = category
    })
    return acc
  }, {})

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-populate firm type when company changes
      if (field === 'company') {
        updated.firm_type = firmTypeMapping[value] || ''
      }
      
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Only create access request - no auth account needed yet
      const { error: requestError } = await supabase
        .from('access_requests')
        .insert([{
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          position: formData.position,
          company: formData.company,
          firm_type: formData.firm_type,
          region: formData.region,
          status: 'pending'
        }])

      if (requestError) {
        // Check if it's a duplicate email error
        if (requestError.code === '23505' || requestError.message.includes('duplicate')) {
          throw new Error('An access request with this email already exists. Please wait for approval or contact support.')
        }
        throw requestError
      }

      // Get the created request with timestamp for admin email
      const { data: createdRequest } = await supabase
        .from('access_requests')
        .select('*')
        .eq('email', formData.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Send emails in parallel (don't block on email failures)
      const emailPromises = []
      
      // Email 1: User confirmation
      emailPromises.push(
        sendAccessRequestEmail({
          ...formData,
          created_at: createdRequest?.created_at
        }).catch(err => {
          console.error('Failed to send user confirmation email:', err)
        })
      )
      
      // Email 2: Admin notification
      emailPromises.push(
        sendAdminNotificationEmail(
          createdRequest || formData,
          process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'alex.f.nash@gmail.com'
        ).catch(err => {
          console.error('Failed to send admin notification email:', err)
        })
      )
      
      // Don't wait for emails - they're fire-and-forget
      Promise.all(emailPromises).then(() => {
        console.log('Email notifications sent')
      })

      // Show success page instead of redirecting
      setSubmitted(true)

    } catch (error) {
      console.error('Error:', error)
      setMessage(`Error: ${error.message}`)
      setLoading(false)
    }
  }

  // Show success page after submission
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f7',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '650px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '60px',
          borderRadius: '20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#d1fae5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            fontSize: '40px',
            color: '#065f46'
          }}>
            ✓
          </div>

          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            color: '#1d1d1f',
            letterSpacing: '-0.02em'
          }}>
            Request Confirmed!
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#6e6e73',
            margin: '0 0 32px 0',
            lineHeight: 1.6
          }}>
            Thank you for your interest in <strong style={{ color: '#1d1d1f' }}>Burnout IQ</strong>. We've successfully received your access request.
          </p>

          <div style={{
            backgroundColor: '#f0f9ff',
            borderLeft: '4px solid #06B6D4',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#164e63',
              margin: '0 0 16px 0'
            }}>
              📬 What Happens Next?
            </h3>
            <ol style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '15px',
              lineHeight: 1.8,
              color: '#155e75'
            }}>
              <li>Check your email for a confirmation message</li>
              <li>Our team will review your request within <strong>24-48 hours</strong></li>
              <li>You'll receive an approval email with login instructions</li>
              <li>Follow the steps to set up your password and start tracking</li>
            </ol>
          </div>

          <div style={{
            backgroundColor: '#fef3c7',
            borderLeft: '4px solid #f59e0b',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <p style={{
              margin: 0,
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#78350f'
            }}>
              <strong style={{ color: '#92400e' }}>📧 Check your inbox:</strong> We've sent a confirmation email. If you don't see it, check your spam folder.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            borderRadius: '12px',
            padding: '28px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              margin: '0 0 16px 0'
            }}>
              While You Wait, Here's What You'll Get:
            </h3>
            <div style={{
              fontSize: '15px',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.95)'
            }}>
              ⏱️ Precision hour tracking with smart analytics<br/>
              📊 Real-time burnout risk assessment<br/>
              👥 Anonymous peer benchmarking by role & industry<br/>
              🎯 Personalized workload intensity insights<br/>
              📈 Historical trends and weekly projections
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/landing"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                backgroundColor: '#4F46E5',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Explore Features
            </a>
            <a
              href="/login"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                backgroundColor: 'transparent',
                color: '#4F46E5',
                textDecoration: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                border: '2px solid #4F46E5',
                cursor: 'pointer'
              }}
            >
              Already Have Access? Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f7',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '50px 60px',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '700',
            margin: '0 0 12px 0',
            color: '#1d1d1f',
            letterSpacing: '-0.03em'
          }}>
            Request <span style={{ color: '#06B6D4', fontWeight: '800' }}>Access</span>
          </h1>
          <p style={{
            fontSize: '17px',
            color: '#6e6e73',
            margin: 0,
            lineHeight: 1.5
          }}>
            Fill out the form below to request access to Burnout IQ. We'll review your request and get back to you soon.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Profile Information */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1d1d1f' }}>
              Profile Information
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                style={inputStyle}
                placeholder="your.email@company.com"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="John"
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Position *</label>
              <select
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Select position</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Company/Firm *</label>
              <select
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Select company</option>
                {Object.entries(groupedCompanies).map(([category, firms]) => (
                  <optgroup key={category} label={category}>
                    {firms.map(firm => (
                      <option key={firm} value={firm}>{firm}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Firm Type</label>
              <input
                type="text"
                value={formData.firm_type}
                readOnly
                style={{...inputStyle, backgroundColor: '#f5f5f7', cursor: 'not-allowed'}}
              />
              <p style={{ fontSize: '12px', color: '#6e6e73', marginTop: '6px' }}>
                Automatically populated based on company selection
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Region *</label>
              <select
                value={formData.region}
                onChange={(e) => handleChange('region', e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Select region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '17px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: loading ? 0.6 : 1,
              marginBottom: '20px'
            }}
          >
            {loading ? 'Submitting Request...' : 'Submit Access Request'}
          </button>

          {message && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: message.includes('Error') ? '#FFEBEE' : '#E8F5E9',
              border: `1px solid ${message.includes('Error') ? '#FFCDD2' : '#C8E6C9'}`,
              color: message.includes('Error') ? '#C62828' : '#2E7D32',
              fontSize: '15px',
              lineHeight: 1.5
            }}>
              {message}
            </div>
          )}

          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            paddingTop: '30px',
            borderTop: '1px solid #e5e5e7'
          }}>
            <p style={{ fontSize: '14px', color: '#6e6e73', marginBottom: '12px' }}>
              Already have an account?
            </p>
            <a
              href="/login"
              style={{
                color: '#4F46E5',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600'
              }}
            >
              Sign In →
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#1d1d1f',
  marginBottom: '8px'
}

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid #d2d2d7',
  fontSize: '16px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: 'white'
}

