'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { DesktopWallpaper } from './DesktopWallpaper'
import { CRTOverlay } from './CRTOverlay'
import { DesktopIcon, DESKTOP_ICONS } from './DesktopIcon'
import { ContextMenu } from './ContextMenu'

export function Desktop() {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  return (
    <motion.div
      className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.3, 0, 0.7, 0.4, 1] }}
      transition={{ duration: 0.6, times: [0, 0.1, 0.2, 0.5, 0.7, 1], ease: 'easeOut' }}
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenu(null)}
    >
      <DesktopWallpaper />

      {/* Icon grid */}
      <div
        className="absolute top-4 left-4 flex flex-col flex-wrap gap-1"
        style={{ height: 'calc(100vh - 60px)', zIndex: 10 }}
      >
        {DESKTOP_ICONS.map((icon) => (
          <DesktopIcon key={icon.appId} config={icon} />
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      <CRTOverlay />
    </motion.div>
  )
}
