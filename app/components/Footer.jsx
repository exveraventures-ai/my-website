export default function Footer() {
  return (
    <footer style={{
      padding: '60px 40px 40px 40px',
      backgroundColor: '#f5f5f7',
      borderTop: '1px solid rgba(0,0,0,0.1)',
      marginTop: '80px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand Section */}
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1d1d1f',
              marginBottom: '16px'
            }}>
              Work<span style={{ color: '#34C759' }}>Well</span>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6e6e73',
              lineHeight: '1.6',
              margin: 0
            }}>
              Built for sustainable high performance.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '16px'
            }}>
              Legal
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '12px' }}>
                <a href="/privacy" style={{
                  fontSize: '14px',
                  color: '#6e6e73',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#007AFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6e6e73'}>
                  Privacy Policy
                </a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="/terms" style={{
                  fontSize: '14px',
                  color: '#6e6e73',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#007AFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6e6e73'}>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '16px'
            }}>
              Quick Links
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '12px' }}>
                <a href="/landing" style={{
                  fontSize: '14px',
                  color: '#6e6e73',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#007AFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6e6e73'}>
                  Home
                </a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="/login" style={{
                  fontSize: '14px',
                  color: '#6e6e73',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#007AFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6e6e73'}>
                  Sign In
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          paddingTop: '40px',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6e6e73',
            margin: 0
          }}>
            © 2025 Burnout IQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
