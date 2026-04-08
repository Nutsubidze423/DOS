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

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

export function Desktop() {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showBsod, setShowBsod] = useState(false)
  const konamiRef = useRef<string[]>([])

  // Prime the audio context on first render so sounds work immediately
  useEffect(() => {
    initSounds()
  }, [])

  // Konami code listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      konamiRef.current = [...konamiRef.current, e.key].slice(-10)
      if (konamiRef.current.join(',') === KONAMI.join(',')) {
        setShowBsod(true)
        konamiRef.current = []
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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
      <Clippy />
      {showBsod && <BSOD onDismiss={() => setShowBsod(false)} />}
    </div>
  )
}
