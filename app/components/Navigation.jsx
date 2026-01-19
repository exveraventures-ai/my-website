"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { useIsMobile } from '../lib/useMediaQuery'
import { isCapacitor } from '../lib/capacitorNavigation'

export default function Navigation({ userProfile: propUserProfile }) {
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState(propUserProfile)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!propUserProfile) {
      checkUser()
    }
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()
      if (profile) {
        setUserProfile(profile)
      }
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('burnoutiQ_user_id')
    if (isCapacitor()) {
      window.location.href = '/login'
    } else {
      window.location.href = '/login'
    }
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/hours', label: 'Working Hours' },
    { href: '/health', label: 'Health Stats' },
    { href: '/compare', label: 'Comparisons' },
    { href: '#methodology', label: 'Methodology', isAnchor: true }
  ]

  const getActiveLinkStyle = (href) => {
    if (href === '#methodology') return {}
    const isActive = pathname === href
    return isActive ? {
      fontWeight: '600',
      color: 'var(--primary)'
    } : {}
  }

  const navLinkStyle = {
    color: 'var(--foreground)',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'opacity 0.2s'
  }

  const handleMethodologyClick = (e) => {
    e.preventDefault()
    setShowProfileMenu(false)
    setMobileMenuOpen(false)
    setTimeout(() => {
      const element = document.getElementById('methodology')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        const collapseButton = element.querySelector('button')
        if (collapseButton) {
          collapseButton.click()
        }
      }
    }, 100)
  }

  return (
    <nav style={{
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '12px 20px' : '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '30px',
        position: 'relative'
      }}>
        <a href="/dashboard" onClick={() => { setShowProfileMenu(false); setMobileMenuOpen(false) }} style={{
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: '700',
          color: 'var(--foreground)',
          textDecoration: 'none',
          letterSpacing: '-0.02em'
        }}>
          Burnout <span style={{ color: 'var(--primary)', fontWeight: '800' }}>IQ</span>
        </a>

        {!isMobile && (
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={link.isAnchor ? handleMethodologyClick : () => { setShowProfileMenu(false) }}
                style={{
                  ...navLinkStyle,
                  ...getActiveLinkStyle(link.href)
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--foreground)',
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
        )}

        {!isMobile && userProfile && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                padding: '8px 16px',
                backgroundColor: userProfile?.is_pro ? '#FFD700' : 'var(--primary)',
                color: userProfile?.is_pro ? 'var(--foreground)' : 'var(--primary-foreground)',
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
                  backgroundColor: 'var(--card)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 1000,
                  minWidth: '240px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)'
                }}>
                  {userProfile && (
                    <div style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>
                        {userProfile.email}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                        {userProfile.position} · {userProfile.company}
                      </div>
                    </div>
                  )}
                  <a href="/profile" onClick={() => setShowProfileMenu(false)} style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: 'var(--foreground)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    Profile Settings
                  </a>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--destructive)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {isMobile && mobileMenuOpen && (
          <>
            <div
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 998
              }}
            />
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: '20px',
              backgroundColor: 'var(--card)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              minWidth: '200px',
              overflow: 'hidden',
              zIndex: 999,
              border: '1px solid var(--border)'
            }}>
              {navLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={link.isAnchor ? handleMethodologyClick : () => { setMobileMenuOpen(false) }}
                  style={{
                    display: 'block',
                    padding: '14px 16px',
                    color: link.href === pathname ? 'var(--primary)' : 'var(--foreground)',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: link.href === pathname ? '600' : '500',
                    borderBottom: index < navLinks.length - 1 ? '1px solid var(--border)' : 'none'
                  }}
                >
                  {link.label}
                </a>
              ))}
              {userProfile && (
                <>
                  <div style={{
                    height: '1px',
                    backgroundColor: 'var(--border)',
                    margin: '8px 0'
                  }} />
                  <a href="/profile" onClick={() => setMobileMenuOpen(false)} style={{
                    display: 'block',
                    padding: '14px 16px',
                    color: 'var(--foreground)',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: '500',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    Profile Settings
                  </a>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--destructive)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontFamily: 'inherit'
                    }}
                  >
                    🚪 Sign Out
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
