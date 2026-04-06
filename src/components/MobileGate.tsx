'use client'

import { useEffect, useState } from 'react'

export function MobileGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!isMobile) return <>{children}</>

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#0a0a0f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 32, textAlign: 'center',
      fontFamily: 'monospace',
    }}>
      {/* Monitor icon */}
      <div style={{ fontSize: 64, marginBottom: 24 }}>🖥️</div>

      <div style={{
        color: '#00ff88', fontSize: 20, fontWeight: 700,
        marginBottom: 12, letterSpacing: '0.05em',
      }}>
        PortfolioOS
      </div>

      <div style={{
        color: '#ffffff', fontSize: 15, fontWeight: 600,
        marginBottom: 8,
      }}>
        Best experienced on desktop
      </div>

      <div style={{
        color: '#888', fontSize: 13, lineHeight: 1.6,
        maxWidth: 280, marginBottom: 32,
      }}>
        This portfolio runs a full OS simulation — drag windows, play Minesweeper, chat with AI.
        It needs a real screen to shine.
      </div>

      {/* Win98-style info box */}
      <div style={{
        background: '#c0bdb5',
        border: '2px solid',
        borderColor: '#ffffff #404040 #404040 #ffffff',
        padding: '12px 20px',
        maxWidth: 300,
        textAlign: 'left',
      }}>
        <div style={{ fontSize: 11, color: '#000', fontWeight: 700, marginBottom: 6 }}>
          System Requirements
        </div>
        <div style={{ fontSize: 11, color: '#333', lineHeight: 1.8 }}>
          • Screen width: ≥ 900px<br />
          • Pointing device: mouse<br />
          • Patience: optional
        </div>
      </div>

      <div style={{ marginTop: 28, fontSize: 11, color: '#444' }}>
        Demetre Nutsubidze · demetrenutsubidze423@gmail.com
      </div>
    </div>
  )
}
