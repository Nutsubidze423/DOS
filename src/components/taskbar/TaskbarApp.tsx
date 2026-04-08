'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWindowStore } from '@/store/windowStore'
import { WindowState } from '@/types'

interface TaskbarAppProps {
  win: WindowState
  isActive: boolean
}

interface MenuPos {
  x: number
  y: number
}

export function TaskbarApp({ win, isActive }: TaskbarAppProps) {
  const { focusWindow, minimizeWindow, restoreWindow, closeWindow, maximizeWindow } = useWindowStore()
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    if (win.isMinimized) {
      restoreWindow(win.id)
    } else if (isActive) {
      minimizeWindow(win.id)
    } else {
      focusWindow(win.id)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    if (!menuPos) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPos(null)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuPos])

  const canRestore = win.isMinimized || win.isMaximized

  return (
    <>
      <motion.button
        className="h-[33px] min-w-[150px] max-w-[200px] flex items-center gap-[6px] px-[10px] font-ui text-[13px] text-black select-none overflow-hidden"
        style={{
          background: 'var(--color-chrome)',
          border: '2px solid',
          borderColor: isActive && !win.isMinimized
            ? 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)'
            : 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
          boxShadow: isActive && !win.isMinimized ? 'inset 1px 1px 2px rgba(0,0,0,0.2)' : 'none',
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        whileHover={{ filter: 'brightness(1.05)' }}
        layoutId={`taskbar-${win.id}`}
      >
        {!win.isMinimized && (
          <motion.div
            className="w-[8px] h-[8px] rounded-full flex-shrink-0"
            style={{ background: '#00cc66', boxShadow: '0 0 4px #00ff88' }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        )}
        <span className="truncate">{win.title}</span>
      </motion.button>

      {menuPos && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuPos.y,
            left: menuPos.x,
            zIndex: 9999,
            background: 'var(--color-chrome)',
            border: '2px solid',
            borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
            minWidth: '140px',
            padding: '2px 0',
          }}
        >
          <button
            className="font-ui text-[12px] text-black w-full text-left px-3 py-[4px] hover:bg-[#000080] hover:text-white disabled:opacity-40 disabled:cursor-default"
            disabled={!canRestore}
            onClick={() => { restoreWindow(win.id); setMenuPos(null) }}
          >
            Restore
          </button>
          <button
            className="font-ui text-[12px] text-black w-full text-left px-3 py-[4px] hover:bg-[#000080] hover:text-white disabled:opacity-40 disabled:cursor-default"
            disabled={win.isMinimized}
            onClick={() => { minimizeWindow(win.id); setMenuPos(null) }}
          >
            Minimize
          </button>
          <button
            className="font-ui text-[12px] text-black w-full text-left px-3 py-[4px] hover:bg-[#000080] hover:text-white disabled:opacity-40 disabled:cursor-default"
            disabled={win.isMaximized}
            onClick={() => { maximizeWindow(win.id); setMenuPos(null) }}
          >
            Maximize
          </button>
          <div className="border-t border-[#808080] mx-2 my-[2px]" />
          <button
            className="font-ui text-[12px] text-black w-full text-left px-3 py-[4px] hover:bg-[#000080] hover:text-white"
            onClick={() => { closeWindow(win.id); setMenuPos(null) }}
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}
