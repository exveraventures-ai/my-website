"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [hasAccess, setHasAccess] = useState(true)

  useEffect(() => {
    document.title = 'Reset Password - Burnout IQ'
    
    // Check if we have a valid session from the reset link
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setError('Invalid or expired reset link. Please request a new password reset.')
        return
      }

      // Check if user has an approved account
      const email = session.user.email
      setUserEmail(email)

      const { data: profile } = await supabase
        .from('users')
        .select('is_approved')
        .eq('email', email)
        .single()

      if (!profile) {
        // No profile exists - check if they have a pending request
        const { data: accessRequest } = await supabase
          .from('access_requests')
          .select('status')
          .eq('email', email)
          .single()

        if (accessRequest && accessRequest.status === 'pending') {
          setError('Your access request is pending approval. You cannot reset your password until your account is approved.')
          setHasAccess(false)
        } else {
          setError('You do not have access to Burnout IQ. Please request access first.')
          setHasAccess(false)
        }
      } else if (!profile.is_approved) {
        setError('Your account is pending approval. You cannot reset your password until your account is approved.')
        setHasAccess(false)
      }
    })
  }, [])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage('✓ Password updated successfully! Redirecting to login...')
      
      // Sign out and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login?message=password-reset-success')
      }, 2000)
      
    } catch (error) {
      setError(`Error: ${error.message}`)
    }

    setLoading(false)
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
        maxWidth: '450px',
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
            Burnout <span style={{ color: '#06B6D4', fontWeight: '800' }}>IQ</span>
          </h1>
          <p style={{
            fontSize: '19px',
            color: '#6e6e73',
            margin: 0
          }}>
            Set your new password
          </p>
        </div>

        {error && !hasAccess ? (
          <div>
            <p style={{
              textAlign: 'center',
              color: '#FF3B30',
              fontSize: '15px',
              fontWeight: '500',
              marginBottom: '20px',
              lineHeight: 1.6
            }}>
              {error}
            </p>
            <button
              onClick={() => router.push('/request-access')}
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
                fontFamily: 'inherit',
                marginBottom: '12px'
              }}
            >
              Request Access
            </button>
            <button
              onClick={() => router.push('/login')}
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
              Back to Login
            </button>
          </div>
        ) : error && !message ? (
          <div>
            <p style={{
              textAlign: 'center',
              color: '#FF3B30',
              fontSize: '15px',
              fontWeight: '500',
              marginBottom: '20px'
            }}>
              {error}
            </p>
            <button
              onClick={() => router.push('/login')}
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
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
                placeholder="••••••••"
                disabled={loading || !!message}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
                placeholder="••••••••"
                disabled={loading || !!message}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!message}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: '600',
                cursor: (loading || message) ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: (loading || message) ? 0.6 : 1
              }}
            >
              {loading ? 'Updating...' : message ? 'Redirecting...' : 'Update Password'}
            </button>

            {message && (
              <p style={{
                marginTop: '20px',
                textAlign: 'center',
                color: '#34C759',
                fontSize: '15px',
                fontWeight: '500'
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
                fontWeight: '500'
              }}>
                {error}
              </p>
            )}
          </form>
        )}
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
  boxSizing: 'border-box'
}
