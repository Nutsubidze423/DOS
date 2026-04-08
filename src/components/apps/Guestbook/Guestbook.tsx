'use client'

import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'portfolioOS_guestbook'

interface Entry {
  name: string
  message: string
  time: string
}

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [name, setName]       = useState('')
  const [message, setMessage] = useState('')
  const [err, setErr]         = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setEntries(JSON.parse(raw) as Entry[])
    } catch {}
  }, [])

  const submit = () => {
    if (!name.trim())    { setErr('Name is required.'); return }
    if (!message.trim()) { setErr('Message is required.'); return }
    const entry: Entry = {
      name: name.trim(),
      message: message.trim(),
      time: new Date().toLocaleString(),
    }
    const next = [...entries, entry]
    setEntries(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setName('')
    setMessage('')
    setErr('')
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-chrome)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '5px 10px', borderBottom: '2px solid var(--color-bevel-dark)', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', flexShrink: 0 }}>
        📖 Visitor Guestbook
      </div>

      {/* Entry list */}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.length === 0 && (
          <div style={{ color: '#888', fontFamily: 'monospace', fontSize: 12, textAlign: 'center', marginTop: 24 }}>
            No entries yet — be the first to sign!
          </div>
        )}
        {entries.map((e, i) => (
          <div key={i} style={{ background: '#fff', border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)', padding: '6px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', color: '#000080' }}>{e.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#888' }}>{e.time}</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', color: '#222' }}>{e.message}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{ borderTop: '2px solid var(--color-bevel-dark)', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
        {err && <div style={{ color: '#cc0000', fontFamily: 'monospace', fontSize: 11 }}>{err}</div>}
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Your name"
          maxLength={50}
          style={{ padding: '3px 6px', fontFamily: 'monospace', fontSize: 12, border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)', background: '#fff' }}
        />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Leave a message for Demetre..."
          maxLength={300}
          rows={3}
          style={{ padding: '3px 6px', fontFamily: 'monospace', fontSize: 12, border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)', background: '#fff', resize: 'none' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#888' }}>{message.length}/300</span>
          <button
            onClick={submit}
            style={{ padding: '3px 16px', fontFamily: 'monospace', fontSize: 12, cursor: 'pointer', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
          >
            Sign Guestbook
          </button>
        </div>
      </div>
    </div>
  )
}
