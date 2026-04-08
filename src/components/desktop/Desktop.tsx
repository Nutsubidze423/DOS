'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { DesktopWallpaper } from './DesktopWallpaper'
import { CRTOverlay } from './CRTOverlay'
import { DesktopIcon, DESKTOP_ICONS } from './DesktopIcon'
import { ContextMenu } from './ContextMenu'
import { WindowManager } from '@/components/windows/WindowManager'
import { Taskbar } from '@/components/taskbar/Taskbar'
import { Screensaver } from './Screensaver'
import { MultiplayerCursors } from './MultiplayerCursors'
import { Clippy } from './Clippy'
import { BSOD } from './BSOD'
import { initSounds } from '@/lib/sounds'
import { ToastContainer } from './ToastContainer'
import { useToastStore } from '@/store/toastStore'
import { useWindowStore } from '@/store/windowStore'

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

export function Desktop() {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showBsod, setShowBsod] = useState(false)
  const konamiRef = useRef<string[]>([])
  const { addToast } = useToastStore()
  const { windows, closeWindow, minimizeWindow } = useWindowStore()

  // Prime the audio context on first render so sounds work immediately
  useEffect(() => {
    initSounds()
  }, [])

  // Konami code listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      konamiRef.current = [...konamiRef.current, e.key].slice(-10)
      if (konamiRef.current.join(',') === KONAMI.join(',')) {
        addToast('CRITICAL ERROR: System instability detected...', 'warning')
        setTimeout(() => setShowBsod(true), 800)
        konamiRef.current = []
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('portfolioOS_greeted')) return
    sessionStorage.setItem('portfolioOS_greeted', '1')
    const t1 = setTimeout(() => addToast('Welcome to PortfolioOS 98 SE!', 'info'), 1500)
    const t2 = setTimeout(() => addToast('Try the Konami code for a surprise...', 'info'), 5000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'F4') {
        e.preventDefault()
        const wins = Object.values(windows)
        if (wins.length === 0) return
        const top = wins.reduce((a, b) => a.zIndex > b.zIndex ? a : b)
        closeWindow(top.id)
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        Object.keys(windows).forEach(id => minimizeWindow(id))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [windows, closeWindow, minimizeWindow])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#0a0a0f]"
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenu(null)}
    >
      <DesktopWallpaper />

      {/* Icon grid */}
      <div
        className="absolute top-4 left-4 flex flex-col flex-wrap gap-1"
        style={{ height: 'calc(100vh - 66px)', zIndex: 10 }}
      >
        {DESKTOP_ICONS.map((icon) => (
          <DesktopIcon key={icon.appId} config={icon} />
        ))}
      </div>

      <WindowManager />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      <Taskbar />
      <CRTOverlay />
      <Screensaver />
      <MultiplayerCursors />
      <ToastContainer />
      <Clippy />
      {showBsod && <BSOD onDismiss={() => setShowBsod(false)} />}
    </div>
  )
}
