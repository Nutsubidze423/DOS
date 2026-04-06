'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { AppId, DesktopIconConfig } from '@/types'
import { useWindowStore } from '@/store/windowStore'

const ICON_MAP: Record<AppId, string> = {
  'about-me': '📝',
  'projects': '📁',
  'skills': '⚙️',
  'terminal': '🖥️',
  'resume': '📄',
  'contact': '✉️',
  'recycle-bin': '🗑️',
  'browser': '🌐',
}

export const DESKTOP_ICONS: DesktopIconConfig[] = [
  { appId: 'projects', label: 'My Projects', icon: ICON_MAP['projects'] },
  { appId: 'about-me', label: 'About Me', icon: ICON_MAP['about-me'] },
  { appId: 'skills', label: 'Skills.exe', icon: ICON_MAP['skills'] },
  { appId: 'resume', label: 'Resume.pdf', icon: ICON_MAP['resume'] },
  { appId: 'contact', label: 'Contact', icon: ICON_MAP['contact'] },
  { appId: 'terminal', label: 'Terminal', icon: ICON_MAP['terminal'] },
  { appId: 'browser', label: 'Internet Explorer', icon: ICON_MAP['browser'] },
  { appId: 'recycle-bin', label: 'Recycle Bin', icon: ICON_MAP['recycle-bin'] },
]

interface DesktopIconProps {
  config: DesktopIconConfig
}

export function DesktopIcon({ config }: DesktopIconProps) {
  const { openWindow } = useWindowStore()
  const [selected, setSelected] = useState(false)
  const [lastClick, setLastClick] = useState(0)

  const handleClick = useCallback(() => {
    const now = Date.now()
    setSelected(true)
    if (now - lastClick < 400) {
      openWindow(config.appId)
      setSelected(false)
    }
    setLastClick(now)
  }, [lastClick, config.appId, openWindow])

  return (
    <motion.button
      className="flex flex-col items-center gap-1 w-[90px] py-2 px-1 rounded cursor-pointer border border-transparent focus:outline-none"
      style={{
        background: selected ? 'rgba(0,0,128,0.5)' : 'transparent',
        borderColor: selected ? 'rgba(0,100,200,0.6)' : 'transparent',
      }}
      onClick={handleClick}
      onBlur={() => setSelected(false)}
      whileHover={{ filter: 'brightness(1.2)' }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Open ${config.label}`}
    >
      <motion.span
        className="text-[40px] leading-none select-none"
        style={{
          filter: selected
            ? 'drop-shadow(0 0 8px rgba(0,255,136,0.5))'
            : 'drop-shadow(0 0 4px rgba(0,255,136,0.2))',
        }}
        animate={selected ? { scale: 1.05 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {config.icon}
      </motion.span>
      <span
        className="font-ui text-[13px] text-white text-center leading-tight select-none"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}
      >
        {config.label}
      </span>
    </motion.button>
  )
}
