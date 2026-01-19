"use client"

export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'var(--font-sans)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'var(--foreground)',
          marginBottom: '16px',
          letterSpacing: '-0.02em'
        }}>
          Burnout <span style={{ color: 'var(--primary)' }}>IQ</span>
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
