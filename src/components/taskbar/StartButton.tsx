'use client'

import { motion } from 'framer-motion'

interface StartButtonProps {
  onClick: () => void
  isMenuOpen: boolean
}

export function StartButton({ onClick, isMenuOpen }: StartButtonProps) {
  return (
    <motion.button
      className="h-[30px] font-ui text-[12px] font-black text-black flex items-center gap-[5px] px-[8px] select-none"
      style={{
        background: 'var(--color-chrome-light)',
        border: '2px solid',
        borderColor: isMenuOpen
          ? 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)'
          : 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
      }}
      onClick={onClick}
      whileTap={{ filter: 'brightness(0.9)' }}
    >
      {/* 4-color Windows flag */}
      <div className="grid grid-cols-2 gap-[1px] w-[16px] h-[16px] flex-shrink-0">
        <div className="bg-red-600" />
        <div className="bg-green-600" />
        <div className="bg-blue-700" />
        <div className="bg-yellow-400" />
      </div>
      <span>Start</span>
    </motion.button>
  )
}
