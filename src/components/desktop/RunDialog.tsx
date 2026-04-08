'use client'

import { useState, useEffect, useRef } from 'react'
import { useWindowStore } from '@/store/windowStore'
import { AppId } from '@/types'

interface RunDialogProps {
  onClose: () => void
}

const RUN_MAP: Record<string, AppId> = {
  'notepad':     'notepad',
  'calc':        'calculator',
  'calculator':  'calculator',
  'solitaire':   'solitaire',
  'sol':         'solitaire',
  'minesweeper': 'minesweeper',
  'winmine':     'minesweeper',
  'paint':       'paint',
  'mspaint':     'paint',
  'terminal':    'terminal',
  'cmd':         'terminal',
  'explorer':    'my-computer',
  'mycomputer':  'my-computer',
  'ie':          'browser',
  'iexplore':    'browser',
  'winamp':      'music-player',
  'music':       'music-player',
  'control':     'control-panel',
  'defrag':      'defrag',
  'resume':      'resume',
  'skills':      'skills',
  'contact':     'contact',
  'about':       'about-me',
  'guestbook':   'guestbook',
  'projects':    'projects',
  'askme':       'ask-me',
}

export function RunDialog({ onClose }: RunDialogProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const { openWindow } = useWindowStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const run = () => {
    const key = value.trim().toLowerCase().replace(/\.exe$/, '')
    const appId = RUN_MAP[key]
    if (!appId) {
      setError(`'${value}' is not recognized as a program name.`)
      return
    }
    openWindow(appId)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9980, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-chrome)',
          border: '2px solid',
          borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
          boxShadow: '4px 4px 12px rgba(0,0,0,0.6)',
          width: 380,
          fontFamily: 'monospace',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div style={{ background: 'linear-gradient(90deg, #000080, #1084d0)', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>Run</span>
          <button onClick={onClose} style={{ width: 18, height: 16, background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)', fontSize: 10, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 32 }}>🖥️</span>
            <span style={{ fontSize: 11, color: '#000' }}>Type the name of a program, folder, or document, and PortfolioOS will open it for you.</span>
          </div>

          {error && <div style={{ fontSize: 11, color: '#cc0000' }}>{error}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, flexShrink: 0 }}>Open:</label>
            <input
              ref={inputRef}
              value={value}
              onChange={e => { setValue(e.target.value); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') run() }}
              placeholder="notepad, calc, solitaire..."
              style={{
                flex: 1, padding: '2px 6px', fontSize: 12,
                border: '2px solid',
                borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)',
                background: '#fff', outline: 'none',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
            {(['OK', 'Cancel'] as const).map(label => (
              <button
                key={label}
                onClick={label === 'OK' ? run : onClose}
                style={{ padding: '3px 18px', fontSize: 12, cursor: 'pointer', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)', minWidth: 70 }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
