'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface TerminalInputProps {
  onSubmit: (value: string) => void
  disabled: boolean
  history: string[]
}

export function TerminalInput({ onSubmit, disabled, history }: TerminalInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const historyPos = useRef(-1)
  const draft = useRef('')  // saves current line when browsing history

  // Reset history position when history changes (new command submitted)
  useEffect(() => { historyPos.current = -1 }, [history])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() && !disabled) {
      historyPos.current = -1
      onSubmit(value.trim())
      setValue('')
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      if (historyPos.current === -1) draft.current = value
      const next = Math.min(historyPos.current + 1, history.length - 1)
      historyPos.current = next
      setValue(history[history.length - 1 - next])
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyPos.current === -1) return
      const next = historyPos.current - 1
      historyPos.current = next
      setValue(next === -1 ? draft.current : history[history.length - 1 - next])
      return
    }
  }

  return (
    <div className="flex items-center gap-2 font-terminal text-os-phosphor text-[16px]">
      <span className="text-os-phosphor select-none">C:\&gt;</span>
      <input
        ref={inputRef}
        className="flex-1 bg-transparent outline-none text-os-phosphor caret-os-phosphor font-terminal text-[16px]"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus
        autoComplete="off"
        spellCheck={false}
        aria-label="Terminal input"
      />
    </div>
  )
}
