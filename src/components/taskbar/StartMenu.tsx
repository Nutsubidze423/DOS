'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useWindowStore } from '@/store/windowStore'
import { useBootStore } from '@/store/bootStore'
import { AppId } from '@/types'

interface StartMenuItem {
  label: string
  appId?: AppId
  icon: string
  action?: () => void
}

const MENU_ITEMS: StartMenuItem[] = [
  { label: 'About Me', appId: 'about-me', icon: '📝' },
  { label: 'My Projects', appId: 'projects', icon: '📁' },
  { label: 'My Computer', appId: 'my-computer', icon: '💻' },
  { label: 'Skills.exe', appId: 'skills', icon: '⚙️' },
  { label: 'Internet Explorer', appId: 'browser', icon: '🌐' },
  { label: 'Terminal', appId: 'terminal', icon: '🖥️' },
  { label: 'Winamp', appId: 'music-player', icon: '🎵' },
  { label: 'Ask About Me', appId: 'ask-me', icon: '🤖' },
  { label: 'Minesweeper', appId: 'minesweeper', icon: '💣' },
  { label: 'Solitaire', appId: 'solitaire', icon: '🃏' },
  { label: 'Paint', appId: 'paint', icon: '🎨' },
  { label: 'Defrag', appId: 'defrag', icon: '💾' },
  { label: 'Control Panel', appId: 'control-panel', icon: '🎛️' },
  { label: 'Calculator', appId: 'calculator', icon: '🔢' },
  { label: 'Notepad', appId: 'notepad', icon: '📓' },
  { label: 'Guestbook', appId: 'guestbook', icon: '📖' },
  { label: 'Contact', appId: 'contact', icon: '✉️' },
]

interface StartMenuProps {
  onClose: () => void
}

export function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow, resetAll } = useWindowStore()
  const { powerOff } = useBootStore()

  const handleItem = useCallback(
    (item: StartMenuItem) => {
      if (item.appId) openWindow(item.appId)
      if (item.action) item.action()
      onClose()
    },
    [openWindow, onClose]
  )

  return (
    <motion.div
      className="absolute bottom-[50px] left-0 w-[275px] overflow-hidden"
      style={{
        background: 'var(--color-chrome)',
        border: '2px solid',
        borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
        boxShadow: '3px 3px 8px rgba(0,0,0,0.5)',
        zIndex: 9999,
      }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Sidebar stripe */}
      <div className="flex">
        <div
          className="w-[8px] flex-shrink-0"
          style={{
            background: 'linear-gradient(180deg, #000080, #1084d0)',
          }}
        />
        <div className="flex-1">
          {/* Header */}
          <div
            className="px-3 py-2 font-ui text-white text-[16px] font-bold"
            style={{ background: 'linear-gradient(90deg, #000080, #1084d0)' }}
          >
            Demetre Nutsubidze
          </div>

          {/* Items */}
          {MENU_ITEMS.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3 py-[8px] font-ui text-[14px] text-black hover:bg-[#000080] hover:text-white text-left"
              onClick={() => handleItem(item)}
            >
              <span className="text-[20px] w-6 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-os-chrome-dark mx-2 my-1" />

          {/* Shutdown */}
          <button
            className="w-full flex items-center gap-3 px-3 py-[8px] font-ui text-[14px] text-black hover:bg-[#000080] hover:text-white text-left"
            onClick={() => {
              onClose()
              if (confirm('Shut down PortfolioOS?')) {
                resetAll()
                powerOff()
              }
            }}
          >
            <span className="text-[20px] w-6 text-center">⏻</span>
            Shut Down...
          </button>
        </div>
      </div>
    </motion.div>
  )
}
