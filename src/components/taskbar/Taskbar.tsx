'use client'

import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useWindowStore } from '@/store/windowStore'
import { usePresenceStore } from '@/store/presenceStore'
import { StartButton } from './StartButton'
import { TaskbarApp } from './TaskbarApp'
import { SystemTray } from './SystemTray'
import { StartMenu } from './StartMenu'

export function Taskbar() {
  const { windows } = useWindowStore()
  const onlineCount = usePresenceStore(s => s.onlineCount)
  const [startMenuOpen, setStartMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => setStartMenuOpen((prev) => !prev), [])
  const closeMenu = useCallback(() => setStartMenuOpen(false), [])

  // Close start menu on click outside
  useEffect(() => {
    if (!startMenuOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-taskbar]')) setStartMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [startMenuOpen])

  const activeWindowId = Object.values(windows).reduce<string | null>(
    (topId, w) => (!w.isMinimized && (!topId || w.zIndex > (windows[topId]?.zIndex ?? 0)) ? w.id : topId),
    null
  )

  const openWindows = Object.values(windows)

  return (
    <div
      data-taskbar=""
      className="absolute bottom-0 left-0 right-0 h-[50px] flex items-center px-[5px] gap-[5px]"
      style={{
        background: 'var(--color-chrome)',
        borderTop: '2px solid var(--color-bevel-light)',
        boxShadow: 'inset 0 1px 0 var(--color-chrome-light)',
        zIndex: 9900,
      }}
    >
      <StartButton onClick={toggleMenu} isMenuOpen={startMenuOpen} />

      {/* Divider */}
      <div
        className="h-[33px] w-[2px] mx-[2px]"
        style={{ borderLeft: '1px solid var(--color-chrome-dark)', borderRight: '1px solid var(--color-bevel-light)' }}
      />

      {/* Open window buttons */}
      <div className="flex gap-[3px] flex-1 overflow-hidden">
        {openWindows.map((win) => (
          <TaskbarApp
            key={win.id}
            win={win}
            isActive={win.id === activeWindowId}
          />
        ))}
      </div>

      {onlineCount > 1 && (
        <div
          className="flex items-center gap-1 px-2 font-ui text-[11px] shrink-0 select-none"
          style={{ color: '#006400', whiteSpace: 'nowrap', borderRight: '1px solid var(--color-bevel-dark)' }}
          title={`${onlineCount} visitors online`}
        >
          🟢 {onlineCount}
        </div>
      )}

      <SystemTray />

      {/* Start Menu */}
      <AnimatePresence>
        {startMenuOpen && <StartMenu onClose={closeMenu} />}
      </AnimatePresence>
    </div>
  )
}
