'use client'

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'portfolioOS_notepad'

export function Notepad() {
  const [content, setContent]   = useState('')
  const [filename, setFilename] = useState('Untitled.txt')
  const [saved, setSaved]       = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw) as { content?: string; filename?: string }
        setContent(data.content ?? '')
        setFilename(data.filename ?? 'Untitled.txt')
      }
    } catch {}
  }, [])

  const persist = (val: string, fname: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ content: val, filename: fname }))
    setSaved(true)
  }

  const handleChange = (val: string) => {
    setContent(val)
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => persist(val, filename), 2000)
  }

  const handleSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    persist(content, filename)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-chrome)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 6px', borderBottom: '1px solid var(--color-bevel-dark)', flexShrink: 0 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11 }}>File:</span>
        <input
          value={filename}
          onChange={e => setFilename(e.target.value)}
          onBlur={() => setSaved(false)}
          style={{
            fontFamily: 'monospace', fontSize: 11, background: '#fff', padding: '1px 4px', width: 130,
            border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)',
          }}
        />
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: saved ? '#006600' : '#cc5500', marginLeft: 2 }}>
          {saved ? '● Saved' : '○ Unsaved'}
        </span>
        <button
          onClick={handleSave}
          style={{ marginLeft: 'auto', padding: '2px 10px', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
        >
          Save
        </button>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={e => handleChange(e.target.value)}
        placeholder="Start typing..."
        spellCheck={false}
        style={{
          flex: 1, resize: 'none', border: 'none', outline: 'none',
          padding: 10, fontFamily: 'monospace', fontSize: 13,
          background: '#fff', lineHeight: 1.5,
          borderTop: '2px solid var(--color-bevel-dark)',
        }}
      />

      {/* Status bar */}
      <div style={{ padding: '2px 8px', borderTop: '1px solid var(--color-bevel-dark)', fontFamily: 'monospace', fontSize: 10, color: '#666', flexShrink: 0 }}>
        {content.length} chars · {content.split('\n').length} lines
      </div>
    </div>
  )
}
