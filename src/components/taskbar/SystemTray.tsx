'use client'

import { useState, useEffect } from 'react'
import { useSoundStore } from '@/store/soundStore'

export function SystemTray() {
  const { muted, toggleMute } = useSoundStore()
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="h-[26px] flex items-center gap-[8px] px-[8px] font-ui text-[11px] text-black select-none"
      style={{
        background: 'var(--color-chrome)',
        border: '2px solid',
        borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)',
      }}
    >
      <span title="Network">📶</span>
      <span title="Battery">🔋</span>
      <button
        onClick={toggleMute}
        title={muted ? 'Unmute' : 'Mute'}
        className="hover:opacity-70"
        aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <span style={{ color: 'var(--color-title-from)', fontWeight: 'bold' }}>
        {time}
      </span>
    </div>
  )
}
