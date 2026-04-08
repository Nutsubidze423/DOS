'use client'

import { useState, useEffect } from 'react'

const TIPS = [
  "It looks like you're exploring a portfolio. Need help with that?",
  "Did you know you can drag windows around? Try it!",
  "Right-click the desktop for display options.",
  "The Terminal supports AI responses — try asking something!",
  "Double-click the desktop icons to open apps.",
  "You can minimize windows using the _ button.",
  "The Guestbook is open — leave a message for Demetre!",
  "Try the Konami code for a surprise... ↑↑↓↓←→←→BA",
]

const SESSION_KEY = 'portfolioOS_clippy_dismissed'

export function Clippy() {
  const [visible, setVisible] = useState(false)
  const [tipIdx, setTipIdx] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(SESSION_KEY)) return
    const t = setTimeout(() => setVisible(true), 8000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visible) return
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 12000)
    return () => clearInterval(t)
  }, [visible])

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem(SESSION_KEY, '1')
  }

  if (!visible) return null

  return (
    <div style={{ position: 'fixed', bottom: 70, right: 20, zIndex: 9800, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <div style={{
        background: '#ffffd6', border: '2px solid #000', borderRadius: 6,
        padding: '8px 28px 8px 10px', maxWidth: 220, position: 'relative',
        boxShadow: '3px 3px 8px rgba(0,0,0,0.5)',
        fontFamily: 'monospace', fontSize: 11, lineHeight: 1.5,
      }}>
        {TIPS[tipIdx]}
        <button
          onClick={dismiss}
          style={{ position: 'absolute', top: 3, right: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#555', lineHeight: 1, padding: 0, fontWeight: 'bold' }}
        >
          ×
        </button>
        <div style={{ position: 'absolute', bottom: -11, right: 26, width: 0, height: 0, borderLeft: '11px solid transparent', borderTop: '11px solid #000' }} />
        <div style={{ position: 'absolute', bottom: -8, right: 28, width: 0, height: 0, borderLeft: '9px solid transparent', borderTop: '9px solid #ffffd6' }} />
      </div>
      <div style={{ fontSize: 38, lineHeight: 1, userSelect: 'none', cursor: 'default', filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.5))' }}>📎</div>
    </div>
  )
}
