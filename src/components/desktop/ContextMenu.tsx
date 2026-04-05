'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface MenuItem {
  label: string
  action: () => void
  divider?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const items: MenuItem[] = [
    { label: 'Refresh', action: onClose },
    { label: 'View', action: onClose, divider: true },
    {
      label: 'Properties', action: () => {
        alert('Demetre Nutsubidze — Front End Developer\nBuilt with Next.js + Framer Motion\nVersion 1.0.0')
        onClose()
      }
    },
  ]

  // Clamp to viewport
  const safeX = Math.min(x, window.innerWidth - 160)
  const safeY = Math.min(y, window.innerHeight - 120)

  return (
    <motion.div
      ref={menuRef}
      className="fixed z-[9990] bg-os-chrome bevel-raised py-[2px] min-w-[160px] shadow-lg"
      style={{ left: safeX, top: safeY }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25, duration: 0.15 }}
    >
      {items.map((item, i) => (
        <div key={i}>
          {item.divider && <div className="border-t border-os-chrome-dark mx-1 my-[2px]" />}
          <button
            className="w-full text-left px-4 py-[3px] font-ui text-[12px] text-black hover:bg-[#000080] hover:text-white"
            onClick={item.action}
          >
            {item.label}
          </button>
        </div>
      ))}
    </motion.div>
  )
}
