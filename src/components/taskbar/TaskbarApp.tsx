'use client'

import { motion } from 'framer-motion'
import { useWindowStore } from '@/store/windowStore'
import { WindowState } from '@/types'

interface TaskbarAppProps {
  win: WindowState
  isActive: boolean
}

export function TaskbarApp({ win, isActive }: TaskbarAppProps) {
  const { focusWindow, minimizeWindow, restoreWindow } = useWindowStore()

  const handleClick = () => {
    if (win.isMinimized) {
      restoreWindow(win.id)
    } else if (isActive) {
      minimizeWindow(win.id)
    } else {
      focusWindow(win.id)
    }
  }

  return (
    <motion.button
      className="h-[26px] min-w-[120px] max-w-[160px] flex items-center gap-[6px] px-[8px] font-ui text-[11px] text-black select-none overflow-hidden"
      style={{
        background: 'var(--color-chrome)',
        border: '2px solid',
        borderColor: isActive && !win.isMinimized
          ? 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)'
          : 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
        boxShadow: isActive && !win.isMinimized ? 'inset 1px 1px 2px rgba(0,0,0,0.2)' : 'none',
      }}
      onClick={handleClick}
      whileHover={{ filter: 'brightness(1.05)' }}
      layoutId={`taskbar-${win.id}`}
    >
      {/* Phosphor dot — active indicator */}
      {!win.isMinimized && (
        <motion.div
          className="w-[6px] h-[6px] rounded-full flex-shrink-0"
          style={{
            background: '#00cc66',
            boxShadow: '0 0 4px #00ff88',
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      )}
      <span className="truncate">{win.title}</span>
    </motion.button>
  )
}
