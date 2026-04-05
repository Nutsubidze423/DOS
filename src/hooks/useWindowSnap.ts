'use client'

import { useCallback } from 'react'
import { useWindowStore } from '@/store/windowStore'

const SNAP_THRESHOLD = 12

export function useWindowSnap() {
  const { maximizeWindow, updatePosition, updateSize } = useWindowStore()

  const checkSnap = useCallback(
    (id: string, x: number, y: number) => {
      const TASKBAR_HEIGHT = 40
      const W = window.innerWidth
      const H = window.innerHeight - TASKBAR_HEIGHT

      // Top edge → maximize
      if (y <= SNAP_THRESHOLD) {
        maximizeWindow(id)
        return
      }

      // Left edge → snap to left half
      if (x <= SNAP_THRESHOLD) {
        updatePosition(id, { x: 0, y: 0 })
        updateSize(id, { width: W / 2, height: H })
        return
      }

      // Right edge → snap to right half
      if (x >= W - SNAP_THRESHOLD) {
        updatePosition(id, { x: W / 2, y: 0 })
        updateSize(id, { width: W / 2, height: H })
        return
      }
    },
    [maximizeWindow, updatePosition, updateSize]
  )

  return { checkSnap }
}
