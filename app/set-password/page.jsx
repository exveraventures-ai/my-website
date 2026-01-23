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
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    document.title = 'Set Password - Burnout IQ'
  }, [])

  const handleCheckEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      console.log('Checking email:', email)
      
      // Check access_requests table first (this is public readable)
      const { data: accessRequest, error: accessError } = await supabase
        .from('access_requests')
        .select('status')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      console.log('Access request:', accessRequest, 'Error:', accessError)

      if (!accessRequest) {
        setError('No account found with this email. Please request access first at the Request Access page.')
        setLoading(false)
        return
      }

      if (accessRequest.status === 'pending') {
        setError('Your access request is pending approval. Please wait for admin approval.')
        setLoading(false)
        return
      }

      if (accessRequest.status === 'rejected') {
        setError('Your access request was declined. Please contact support.')
        setLoading(false)
        return
      }

      if (accessRequest.status === 'approved') {
        // Account is approved, move to password step
        setStep(2)
      } else {
        setError('Invalid account status. Please contact support.')
        setLoading(false)
        return
      }
    } catch (error) {
      console.error('Error checking email:', error)
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
      console.log('Attempting to sign up user with email:', email)
      
      // Try to sign up the user with the password (disable email confirmation)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            email: email
          }
        }
      })

      console.log('Sign up response:', { data: signUpData, error: signUpError })

      if (signUpError) {
        console.error('Sign up error:', signUpError)
        // If user already exists in auth, they should use login/forgot password
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
          setError('An account already exists with this email. Please use the login page. If you forgot your password, use "Forgot Password".')
          setLoading(false)
          return
        } else {
          throw signUpError
        }
      }

      // Check if email confirmation is required
      if (signUpData?.user && !signUpData.user.confirmed_at) {
        console.warn('Email confirmation required - user needs to confirm email')
        setError('⚠️ Email confirmation is required. Please check your email inbox for a confirmation link, or contact your administrator to manually confirm your account.')
        setLoading(false)
        return
      }
      
      // Check if user already exists (signup returns user but they're already registered)
      if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        console.warn('User already exists')
        setError('This email is already registered. Please use the login page. If you forgot your password, use "Forgot Password".')
        setLoading(false)
        return
      }

      console.log('Sign up successful! User:', signUpData?.user)
      setMessage('✓ Password set successfully! Redirecting to login...')
      setIsRedirecting(true)
      
      // Sign out and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login?message=password-set-success')
      }, 2000)
      
    } catch (error) {
      console.error('Error setting password:', error)
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
                disabled={loading || isRedirecting}
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
                disabled={loading || isRedirecting}
              />
            </div>

            <button
              type="submit"
              disabled={loading || isRedirecting}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: '600',
                cursor: (loading || isRedirecting) ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: (loading || isRedirecting) ? 0.6 : 1,
                marginBottom: '12px'
              }}
            >
              {loading ? 'Setting Password...' : isRedirecting ? 'Redirecting...' : 'Set Password & Continue'}
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
              disabled={loading || isRedirecting}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'white',
                color: '#4F46E5',
                border: '2px solid #4F46E5',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: '600',
                cursor: (loading || isRedirecting) ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: (loading || isRedirecting) ? 0.6 : 1
              }}
            >
              Change Email
            </button>

            {message && isRedirecting && (
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
