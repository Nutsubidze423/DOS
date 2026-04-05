'use client'

import { useDrag } from '@use-gesture/react'
import { useWindowStore } from '@/store/windowStore'

type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

const MIN_WIDTH = 280
const MIN_HEIGHT = 200

export function useWindowResize(id: string, direction: ResizeDirection) {
  const { windows, updatePosition, updateSize } = useWindowStore()

  const bind = useDrag(({ delta: [dx, dy] }) => {
    const win = windows[id]
    if (!win) return

    let { x, y } = win.position
    let { width, height } = win.size

    if (direction.includes('e')) width = Math.max(MIN_WIDTH, width + dx)
    if (direction.includes('s')) height = Math.max(MIN_HEIGHT, height + dy)
    if (direction.includes('w')) {
      const newWidth = Math.max(MIN_WIDTH, width - dx)
      x = x + width - newWidth
      width = newWidth
    }
    if (direction.includes('n')) {
      const newHeight = Math.max(MIN_HEIGHT, height - dy)
      y = y + height - newHeight
      height = newHeight
    }

    updatePosition(id, { x, y })
    updateSize(id, { width, height })
  })

  return bind
}
