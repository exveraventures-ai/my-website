"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SetPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Enter email, 2: Set password

  useEffect(() => {
    document.title = 'Set Password - Burnout IQ'
  }, [])

  const handleCheckEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Check if user has an approved account
      const { data: profile } = await supabase
        .from('users')
        .select('is_approved')
        .eq('email', email)
        .single()

      if (!profile) {
        setError('No account found with this email. Please contact your admin or request access.')
        setLoading(false)
        return
      }

      if (!profile.is_approved) {
        setError('Your account is pending approval. Please wait for admin approval.')
        setLoading(false)
        return
      }

      // Account is approved, move to password step
      setStep(2)
      setMessage('✓ Account verified! Please set your password below.')
    } catch (error) {
      setError(`Error: ${error.message}`)
    }

    setLoading(false)
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

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
      // Sign up the user with the password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      })

      if (signUpError) {
        // If user already exists, try to sign in
        if (signUpError.message.includes('already registered')) {
          // User exists but needs to reset password - use update instead
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          })
          
          if (signInError) {
            // Password is wrong, they need to use forgot password
            setError('An account already exists with this email. If you forgot your password, please use the "Forgot Password" option on the login page.')
            setLoading(false)
            return
          }
        } else {
          throw signUpError
        }
      }

      setMessage('✓ Password set successfully! Redirecting to login...')
      
      // Sign out and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login?message=password-set-success')
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
            {step === 1 ? 'Welcome! Set up your account' : 'Create your password'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleCheckEmail}>
            <div style={{ marginBottom: '30px' }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="your.email@company.com"
                disabled={loading}
              />
              <p style={{
                fontSize: '13px',
                color: '#6e6e73',
                marginTop: '8px',
                lineHeight: 1.5
              }}>
                Enter the email address you used to request access
              </p>
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
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>

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
        ) : (
          <form onSubmit={handleSetPassword}>
            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#E8F5E9', borderRadius: '8px', border: '1px solid #C8E6C9' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#2E7D32', fontWeight: '500' }}>
                ✓ Email verified: {email}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Create Password</label>
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
              <label style={labelStyle}>Confirm Password</label>
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
                opacity: (loading || message) ? 0.6 : 1,
                marginBottom: '12px'
              }}
            >
              {loading ? 'Setting Password...' : message ? 'Redirecting...' : 'Set Password & Continue'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1)
                setPassword('')
                setConfirmPassword('')
                setError('')
                setMessage('')
              }}
              disabled={loading || !!message}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'white',
                color: '#4F46E5',
                border: '2px solid #4F46E5',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: '600',
                cursor: (loading || message) ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: (loading || message) ? 0.6 : 1
              }}
            >
              Change Email
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
                fontWeight: '500',
                lineHeight: 1.6
              }}>
                {error}
              </p>
            )}
          </form>
        )}

        <div style={{
          marginTop: '30px',
          textAlign: 'center'
        }}>
          <button
            onClick={() => router.push('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4F46E5',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Already have a password? Sign in
          </button>
        </div>
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
