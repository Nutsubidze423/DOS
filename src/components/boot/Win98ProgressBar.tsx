'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const SEGMENT_COUNT = 22

export function Win98ProgressBar({ onComplete }: { onComplete: () => void }) {
  const [filled, setFilled] = useState(0)

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current++
      setFilled(current)
      if (current >= SEGMENT_COUNT) {
        clearInterval(interval)
        setTimeout(onComplete, 400)
      }
    }, 55)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      className="w-full h-full bg-[#008080] flex flex-col items-center justify-center gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="font-terminal text-white text-2xl tracking-widest">
        Starting Windows 98...
      </div>
      <div className="flex gap-[3px]">
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
          <motion.div
            key={i}
            className="w-[18px] h-[14px]"
            animate={{ backgroundColor: i < filled ? '#000080' : '#c0c0c0' }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </div>
    </motion.div>
  )
}
