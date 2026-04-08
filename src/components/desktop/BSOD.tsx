'use client'

import { useEffect } from 'react'

interface BSODProps {
  onDismiss: () => void
}

export function BSOD({ onDismiss }: BSODProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { e.preventDefault(); onDismiss() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onDismiss])

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, background: '#0000aa',
        color: '#fff', fontFamily: 'monospace', fontSize: 14,
        padding: '48px 10%', zIndex: 99999,
        userSelect: 'none', cursor: 'default',
      }}
    >
      <div style={{ maxWidth: 600 }}>
        <div style={{ background: '#aaaaaa', color: '#0000aa', padding: '2px 8px', display: 'inline-block', marginBottom: 24, fontSize: 16 }}>
          Windows
        </div>
        <p style={{ marginBottom: 20, lineHeight: 1.8 }}>
          A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +<br />
          00010E36. The current application will be terminated.
        </p>
        <p style={{ marginBottom: 24 }}>
          *  Press any key to terminate the current application.<br />
          *  Press CTRL+ALT+DEL again to restart your computer. You will<br />
          &nbsp;&nbsp; lose any unsaved information in all applications.
        </p>
        <p style={{ animation: 'bsodBlink 1s step-end infinite' }}>Press any key to continue _</p>
      </div>
      <style>{`@keyframes bsodBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
