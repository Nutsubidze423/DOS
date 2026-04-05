'use client'

import { useEffect, useState, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const BIO_TEXT = `Demetre Nutsubidze
Front End Developer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Some developers write code. Demetre orchestrates
digital experiences that live somewhere between
engineering precision and visual poetry.

Born in the era of dial-up modems and pixel fonts,
he carries the soul of the early web — raw,
creative, unapologetically expressive — into
every project he touches.

Armed with React, Angular, Next.js, TypeScript,
Three.js, and Framer Motion, he builds interfaces
that don't just work. They feel alive.

Currently: Available for hire.
Status: Probably refactoring something that
        was already working fine.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"The best code is the kind that makes
 someone smile when they first see it."
`

const CHARS_PER_TICK = 3
const TICK_MS = 18

export function AboutMe() {
  const [displayed, setDisplayed] = useState('')
  const reducedMotion = useReducedMotion()
  const indexRef = useRef(0)

  useEffect(() => {
    if (reducedMotion) {
      setDisplayed(BIO_TEXT)
      return
    }

    const interval = setInterval(() => {
      indexRef.current = Math.min(indexRef.current + CHARS_PER_TICK, BIO_TEXT.length)
      setDisplayed(BIO_TEXT.slice(0, indexRef.current))
      if (indexRef.current >= BIO_TEXT.length) {
        clearInterval(interval)
      }
    }, TICK_MS)

    return () => clearInterval(interval)
  }, [reducedMotion])

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Notepad menu bar */}
      <div
        className="flex gap-0 text-[11px] font-ui text-black bg-os-chrome px-1 py-[2px]"
        style={{ borderBottom: '1px solid var(--color-chrome-dark)' }}
      >
        {['File', 'Edit', 'Format', 'View', 'Help'].map((item) => (
          <button
            key={item}
            className="px-2 py-[1px] hover:bg-[#000080] hover:text-white"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Text area */}
      <div className="flex-1 overflow-auto p-3 font-terminal text-black text-[15px] leading-relaxed whitespace-pre-wrap">
        {displayed}
        <span className="inline-block w-[9px] h-[15px] bg-black align-middle animate-blink" />
      </div>

      {/* Status bar */}
      <div
        className="flex justify-between px-2 py-[2px] font-ui text-[10px] text-black bg-os-chrome"
        style={{ borderTop: '1px solid var(--color-chrome-dark)' }}
      >
        <span>about_me.txt</span>
        <span>Created: 1995-08-24 | Modified: 2026-04-04 | 1.2 KB</span>
      </div>
    </div>
  )
}
