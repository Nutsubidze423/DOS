'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const BIOS_LINES = [
  'Award Modular BIOS v4.51PG, An Energy Star Ally',
  'Copyright (C) 1984-98, Award Software, Inc.',
  '',
  'PortfolioOS BIOS v1.0 — Custom Build',
  '',
  'CPU: Demetre-9000 @ 4200 MHz',
  'Memory Test: 524288K OK',
  '',
  'Detecting IDE drives...',
  'Primary Master:   ST34500A — 4500MB',
  'Primary Slave:    CREATIVITY_MODULE — Unlimited',
  '',
  'Detecting PnP devices...',
  'PnP Init Completed',
  '',
  'Verifying DMI Pool Data........',
  'Boot from CD: Failure',
  'Boot from HDD: PORTFOLIO_OS',
  '',
]

export function BiosScreen({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([])

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i >= BIOS_LINES.length) {
        clearInterval(interval)
        setTimeout(onComplete, 300)
        return
      }
      setVisibleLines((prev) => [...prev, BIOS_LINES[i]])
      i++
    }, 80)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      className="w-full h-full bg-black flex flex-col p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      {visibleLines.map((line, i) => (
        <div key={i} className="font-terminal text-[#c0c0c0] text-sm leading-5">
          {line || '\u00A0'}
        </div>
      ))}
      <div className="font-terminal text-[#c0c0c0] text-sm animate-blink mt-1">_</div>
    </motion.div>
  )
}
