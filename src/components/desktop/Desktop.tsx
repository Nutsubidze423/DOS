'use client'

import { motion } from 'framer-motion'
import { DesktopWallpaper } from './DesktopWallpaper'
import { CRTOverlay } from './CRTOverlay'

export function Desktop() {
  return (
    <motion.div
      className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.3, 0, 0.7, 0.4, 1] }}
      transition={{ duration: 0.6, times: [0, 0.1, 0.2, 0.5, 0.7, 1], ease: 'easeOut' }}
    >
      <DesktopWallpaper />
      {/* Icons, windows, taskbar added in later tasks */}
      <CRTOverlay />
    </motion.div>
  )
}
