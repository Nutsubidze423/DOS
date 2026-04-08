'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useWindowStore } from '@/store/windowStore'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const { openWindow } = useWindowStore()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const safeX = Math.min(x, window.innerWidth - 200)
  const safeY = Math.min(y, window.innerHeight - 200)

  interface MenuItem { label: string; action: () => void; divider?: boolean; disabled?: boolean }

  const items: MenuItem[] = [
    {
      label: 'Refresh',
      action: () => {
        document.querySelectorAll('[data-desktop-icon]').forEach(el => {
          (el as HTMLElement).style.opacity = '0.4'
          setTimeout(() => (el as HTMLElement).style.opacity = '1', 300)
        })
        onClose()
      },
    },
    { label: 'Arrange Icons', action: onClose },
    { label: '─────────────', action: onClose, disabled: true, divider: true },
    { label: '📓 New Notepad', action: () => { openWindow('notepad'); onClose() } },
    { label: '🔢 New Calculator', action: () => { openWindow('calculator'); onClose() } },
    { label: '─────────────', action: onClose, disabled: true, divider: true },
    { label: '🎛️ Control Panel', action: () => { openWindow('control-panel'); onClose() } },
    {
      label: 'Properties',
      action: () => {
        openWindow('about-me')
        onClose()
      },
    },
  ]

  return (
    <motion.div
      ref={menuRef}
      className="fixed z-[9990] bg-os-chrome py-[2px] min-w-[180px]"
      style={{
        left: safeX, top: safeY,
        border: '2px solid',
        borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
        boxShadow: '3px 3px 8px rgba(0,0,0,0.4)',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25, duration: 0.15 }}
    >
      {items.map((item, i) => (
        item.disabled
          ? <div key={i} className="mx-2 my-[2px] border-t border-[#808080]" />
          : (
            <button
              key={i}
              className="w-full text-left px-3 py-[4px] font-ui text-[12px] text-black hover:bg-[#000080] hover:text-white"
              onClick={item.action}
            >
              {item.label}
            </button>
          )
      ))}
    </motion.div>
  )
}
