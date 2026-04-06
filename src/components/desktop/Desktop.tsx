'use client'

import { useState, useCallback, useEffect } from 'react'
import { DesktopWallpaper } from './DesktopWallpaper'
import { CRTOverlay } from './CRTOverlay'
import { DesktopIcon, DESKTOP_ICONS } from './DesktopIcon'
import { ContextMenu } from './ContextMenu'
import { WindowManager } from '@/components/windows/WindowManager'
import { Taskbar } from '@/components/taskbar/Taskbar'
import { Screensaver } from './Screensaver'
import { initSounds } from '@/lib/sounds'

export function Desktop() {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  // Prime the audio context on first render so sounds work immediately
  useEffect(() => {
    initSounds()
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f]"
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
    </div>
  )
}
