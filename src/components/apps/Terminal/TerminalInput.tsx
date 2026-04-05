'use client'

import { useState, useRef, KeyboardEvent } from 'react'

interface TerminalInputProps {
  onSubmit: (value: string) => void
  disabled: boolean
}

export function TerminalInput({ onSubmit, disabled }: TerminalInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() && !disabled) {
      onSubmit(value.trim())
      setValue('')
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
