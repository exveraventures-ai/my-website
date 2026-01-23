"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RequestPro() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState(null)
  const [existingRequest, setExistingRequest] = useState(null)

  useEffect(() => {
    document.title = 'Request Pro Access - Burnout IQ'
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (profile) {
      setUserProfile(profile)

      // Check if already pro
      if (profile.is_pro) {
        router.push('/hours')
        return
      }

      // Check for existing pro request
      const { data: request } = await supabase
        .from('pro_requests')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setExistingRequest(request)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Create pro request
      const { error: insertError } = await supabase
        .from('pro_requests')
        .insert([{
          user_id: userProfile.id,
          email: userProfile.email,
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          company: userProfile.company,
          position: userProfile.position,
          status: 'pending'
        }])

      if (insertError) throw insertError

      // Send admin notification email
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'pro_request',
            data: {
              email: userProfile.email,
              first_name: userProfile.first_name,
              last_name: userProfile.last_name,
              company: userProfile.company,
              position: userProfile.position
            }
          })
        })

        const result = await response.json()
        console.log('Email result:', result)
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Don't fail the whole request if email fails
      }

      setMessage('✓ Pro access request submitted! We\'ll review your request and get back to you soon.')
      
      // Reload to show existing request
      setTimeout(() => {
        loadUserData()
      }, 2000)

    } catch (error) {
      console.error('Error submitting request:', error)
      setError(`Error: ${error.message}`)
    }

    setLoading(false)
  }

  if (!userProfile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f7'
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '40px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '50px 60px',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            margin: '0 0 12px 0',
            color: '#1d1d1f',
            letterSpacing: '-0.03em'
          }}>
            Burnout <span style={{ color: '#06B6D4', fontWeight: '800' }}>IQ</span> <span style={{ color: '#FFD700' }}>Pro</span>
          </h1>
          <p style={{
            fontSize: '19px',
            color: '#6e6e73',
            margin: 0
          }}>
            Request access to advanced burnout analytics
          </p>
        </div>

        {existingRequest ? (
          <div>
            <div style={{
              padding: '24px',
              backgroundColor: existingRequest.status === 'pending' ? '#FFF3CD' : existingRequest.status === 'approved' ? '#D4EDDA' : '#F8D7DA',
              border: `2px solid ${existingRequest.status === 'pending' ? '#FFC107' : existingRequest.status === 'approved' ? '#28A745' : '#DC3545'}`,
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '20px',
                fontWeight: '600',
                color: existingRequest.status === 'pending' ? '#856404' : existingRequest.status === 'approved' ? '#155724' : '#721c24'
              }}>
                {existingRequest.status === 'pending' && '⏳ Request Pending'}
                {existingRequest.status === 'approved' && '✓ Request Approved'}
                {existingRequest.status === 'rejected' && '✗ Request Declined'}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '15px',
                lineHeight: 1.6,
                color: existingRequest.status === 'pending' ? '#856404' : existingRequest.status === 'approved' ? '#155724' : '#721c24'
              }}>
                {existingRequest.status === 'pending' && 'We\'re reviewing your request for Pro access. You\'ll receive an email once it\'s been reviewed.'}
                {existingRequest.status === 'approved' && 'Your Pro access has been approved! Refresh the page to see your burnout metrics.'}
                {existingRequest.status === 'rejected' && 'Your Pro access request was declined. Please contact support for more information.'}
              </p>
            </div>

            <button
              onClick={() => router.push('/hours')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              padding: '24px',
              backgroundColor: '#E8F5E9',
              borderRadius: '12px',
              marginBottom: '30px',
              border: '2px solid #C8E6C9'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#2E7D32' }}>
                🔬 What's included in Pro?
              </h3>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '15px',
                lineHeight: 2,
                color: '#1B5E20'
              }}>
                <li><strong>Overall Burnout Risk Score</strong> - Comprehensive 0-100 risk assessment</li>
                <li><strong>Weekly Workload Average</strong> - Rolling 4-week analysis</li>
                <li><strong>Circadian Disruption Index</strong> - Late-night work pattern tracking</li>
                <li><strong>Recovery Window Status</strong> - Weekend protection rate</li>
                <li><strong>Load Intensity Index</strong> - Workload intensity vs. your baseline</li>
                <li><strong>High-Intensity Streak</strong> - Consecutive days of heavy work</li>
                <li><strong>Recovery Days</strong> - Days with healthy workload</li>
                <li><strong>Advanced Analytics</strong> - Heat maps and deep insights</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{
                padding: '20px',
                backgroundColor: '#f5f5f7',
                borderRadius: '10px',
                marginBottom: '24px'
              }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#6e6e73' }}>
                  YOUR INFORMATION
                </p>
                <p style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#1d1d1f' }}>
                  <strong>Name:</strong> {userProfile.first_name} {userProfile.last_name}
                </p>
                <p style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#1d1d1f' }}>
                  <strong>Email:</strong> {userProfile.email}
                </p>
                <p style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#1d1d1f' }}>
                  <strong>Company:</strong> {userProfile.company || 'Not provided'}
                </p>
                <p style={{ margin: '0', fontSize: '15px', color: '#1d1d1f' }}>
                  <strong>Position:</strong> {userProfile.position || 'Not provided'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !!message}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#FFD700',
                  color: '#1d1d1f',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '17px',
                  fontWeight: '700',
                  cursor: (loading || message) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: (loading || message) ? 0.6 : 1,
                  marginBottom: '12px'
                }}
              >
                {loading ? 'Submitting Request...' : message ? '✓ Request Submitted' : '✨ Request Pro Access'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/hours')}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: 'white',
                  color: '#4F46E5',
                  border: '2px solid #4F46E5',
                  borderRadius: '12px',
                  fontSize: '17px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Maybe Later
              </button>

              {message && (
                <p style={{
                  marginTop: '20px',
                  textAlign: 'center',
                  color: '#34C759',
                  fontSize: '15px',
                  fontWeight: '500',
                  lineHeight: 1.6
                }}>
                  {message}
                </p>
              )}

              {error && (
                <p style={{
                  marginTop: '20px',
                  textAlign: 'center',
                  color: '#FF3B30',
                  fontSize: '15px',
                  fontWeight: '500',
                  lineHeight: 1.6
                }}>
                  {error}
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
