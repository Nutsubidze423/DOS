'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { TerminalInput } from './TerminalInput'
import { runCommand } from '@/lib/terminalCommands'
import { useSoundEffect } from '@/hooks/useSoundEffect'

interface HistoryEntry {
  type: 'input' | 'output' | 'error' | 'ai'
  content: string
}

const WELCOME = `PortfolioOS Terminal v1.0
Copyright (C) 2026 Demetre Nutsubidze

Type 'help' for available commands.
Any other input is handled by the AI assistant.
`

export function Terminal() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: 'output', content: WELCOME },
  ])
  const [streaming, setStreaming] = useState(false)
  const [streamBuffer, setStreamBuffer] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { play } = useSoundEffect()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, streamBuffer])

  const handleSubmit = useCallback(
    async (input: string) => {
      setHistory((prev) => [...prev, { type: 'input', content: input }])

      const result = runCommand(input)

      if (result.type === 'clear') {
        setHistory([])
        return
      }

      if (result.type === 'text') {
        setHistory((prev) => [...prev, { type: 'output', content: result.content }])
        return
      }

      // AI route
      setStreaming(true)
      setStreamBuffer('')

      try {
        const res = await fetch('/api/terminal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
        })

        if (!res.ok || !res.body) {
          const errText = await res.text().catch(() => 'unknown error')
          throw new Error(errText || `HTTP ${res.status}`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          setStreamBuffer(accumulated)
        }

        setHistory((prev) => [...prev, { type: 'ai', content: accumulated }])
        setStreamBuffer('')
      } catch (err) {
        play('error')
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setHistory((prev) => [
          ...prev,
          { type: 'error', content: `Error: ${msg}` },
        ])
        setStreamBuffer('')
      } finally {
        setStreaming(false)
      }
    },
    [play]
  )

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] p-3 overflow-hidden">
      <div className="flex-1 overflow-y-auto font-terminal text-[16px] leading-relaxed space-y-1">
        {history.map((entry, i) => (
          <div key={i}>
            {entry.type === 'input' && (
              <div className="flex gap-2 text-white">
                <span className="text-os-phosphor select-none">C:\&gt;</span>
                <span>{entry.content}</span>
              </div>
            )}
            {entry.type === 'output' && (
              <div className="text-os-phosphor whitespace-pre-wrap">{entry.content}</div>
            )}
            {entry.type === 'ai' && (
              <div className="text-os-phosphor whitespace-pre-wrap opacity-90">{entry.content}</div>
            )}
            {entry.type === 'error' && (
              <div className="text-red-400 whitespace-pre-wrap">{entry.content}</div>
            )}
          </div>
        ))}

        {/* Streaming preview */}
        {streaming && streamBuffer && (
          <div className="text-os-phosphor whitespace-pre-wrap opacity-90">
            {streamBuffer}
            <span className="inline-block w-[9px] h-[15px] bg-os-phosphor align-middle animate-blink ml-1" />
          </div>
        )}
        {streaming && !streamBuffer && (
          <div className="text-os-amber font-terminal text-[14px] opacity-60">
            thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div
        className="pt-2 mt-1"
        style={{ borderTop: '1px solid rgba(0,255,136,0.15)' }}
      >
        <TerminalInput onSubmit={handleSubmit} disabled={streaming} />
      </div>
    </div>
  )
}
