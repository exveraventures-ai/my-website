"use client"

import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  useEffect(() => {
    document.title = 'Burnout IQ - Login'
    checkUser()
    
    // Check for pending approval message in URL
    const urlParams = new URLSearchParams(window.location.search)
    const messageParam = urlParams.get('message')
    if (messageParam === 'pending') {
      setMessage('⚠️ Your account is pending approval. Please wait for admin approval to access the platform.')
    }
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/dashboard')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      })

      if (error) throw error

      setResetEmailSent(true)
      setMessage('✓ Password reset email sent! Check your inbox.')
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    }

    setLoading(false)
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isForgotPassword) {
        await handleForgotPassword(e)
        return
      }
      
      if (isSignUp) {
        // Redirect to request access page instead of signing up directly
        router.push('/request-access')
        return
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data?.session) {
          // Check if user profile exists and is approved
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single()

          if (profile) {
            // Check if user is approved
            if (!profile.is_approved) {
              setMessage('⚠️ Your account is pending approval. Please wait for admin approval to access the platform.')
              await supabase.auth.signOut()
              return
            }
            
            localStorage.setItem('burnoutiQ_user_id', profile.id)
            
            // All approved users (including admins) go to dashboard
            router.push('/dashboard')
          } else {
            // No profile exists, check if there's a pending access request
            const { data: accessRequest } = await supabase
              .from('access_requests')
              .select('*')
              .eq('email', email)
              .eq('status', 'pending')
              .single()

            if (accessRequest) {
              setMessage('⚠️ Your access request is pending approval. Please wait for admin approval.')
              await supabase.auth.signOut()
            } else {
              router.push('/profile')
            }
          }
        }
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`)
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
            {isForgotPassword ? 'Reset your password' : isSignUp ? 'Request access to continue' : 'Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="your.email@company.com"
            />
          </div>

          {!isForgotPassword && (
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>
          )}

          {!isForgotPassword && !isSignUp && (
            <div style={{ marginBottom: '30px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true)
                  setMessage('')
                  setResetEmailSent(false)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4F46E5',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {isForgotPassword && <div style={{ marginBottom: '30px' }} />}

          <button
            type="submit"
            disabled={loading || resetEmailSent}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '17px',
              fontWeight: '600',
              cursor: (loading || resetEmailSent) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: (loading || resetEmailSent) ? 0.6 : 1
            }}
          >
            {loading ? 'Please wait...' : isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {message && (
          <p style={{
            marginTop: '20px',
            textAlign: 'center',
            color: message.includes('Error') ? '#FF3B30' : '#34C759',
            fontSize: '15px',
            fontWeight: '500'
          }}>
            {message}
          </p>
        )}

        <div style={{
          marginTop: '30px',
          textAlign: 'center'
        }}>
          {isForgotPassword ? (
            <button
              onClick={() => {
                setIsForgotPassword(false)
                setMessage('')
                setResetEmailSent(false)
              }}
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
              ← Back to sign in
            </button>
          ) : (
            <button
              onClick={() => {
                if (isSignUp) {
                  setIsSignUp(false)
                  setMessage('')
                } else {
                  router.push('/request-access')
                }
              }}
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
              {isSignUp ? 'Already have an account? Sign in' : "Don't have access? Request access"}
            </button>
          )}
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
