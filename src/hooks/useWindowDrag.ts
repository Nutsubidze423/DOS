'use client'

import { useCallback } from 'react'
import { useDrag } from '@use-gesture/react'
import { useWindowStore } from '@/store/windowStore'
import { useWindowSnap } from './useWindowSnap'

const TASKBAR_HEIGHT = 40

export function useWindowDrag(id: string) {
  const { windows, updatePosition, focusWindow, maximizeWindow } = useWindowStore()
  const { checkSnap } = useWindowSnap()

  const bind = useDrag(
    ({ offset: [x, y], last }) => {
      const win = windows[id]
      if (!win || win.isMaximized) return

      const maxX = window.innerWidth - win.size.width
      const maxY = window.innerHeight - TASKBAR_HEIGHT - win.size.height

      const clampedX = Math.max(0, Math.min(x, maxX))
      const clampedY = Math.max(0, Math.min(y, maxY))

      updatePosition(id, { x: clampedX, y: clampedY })

      if (last) {
        checkSnap(id, clampedX, clampedY)
      }
    },
    {
      from: () => {
        const win = windows[id]
        return [win?.position.x ?? 0, win?.position.y ?? 0]
      },
    }
  )

  const handlePointerDown = useCallback(() => {
    focusWindow(id)
  }, [id, focusWindow])

  // suppress unused warning — maximizeWindow used indirectly via checkSnap
  void maximizeWindow

  return { bind, handlePointerDown }
}
