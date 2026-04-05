'use client'

import React from 'react'
import { useWindowResize } from '@/hooks/useWindowResize'

type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

const CURSOR_MAP: Record<ResizeDirection, string> = {
  n: 'n-resize', ne: 'ne-resize', e: 'e-resize', se: 'se-resize',
  s: 's-resize', sw: 'sw-resize', w: 'w-resize', nw: 'nw-resize',
}

const POSITION_MAP: Record<ResizeDirection, React.CSSProperties> = {
  n:  { top: 0, left: 4, right: 4, height: 4 },
  ne: { top: 0, right: 0, width: 8, height: 8 },
  e:  { top: 4, right: 0, bottom: 4, width: 4 },
  se: { bottom: 0, right: 0, width: 8, height: 8 },
  s:  { bottom: 0, left: 4, right: 4, height: 4 },
  sw: { bottom: 0, left: 0, width: 8, height: 8 },
  w:  { top: 4, left: 0, bottom: 4, width: 4 },
  nw: { top: 0, left: 0, width: 8, height: 8 },
}

interface ResizeHandleProps {
  id: string
  direction: ResizeDirection
}

export function ResizeHandle({ id, direction }: ResizeHandleProps) {
  const bind = useWindowResize(id, direction)

  return (
    <div
      {...bind()}
      className="absolute z-10 touch-none"
      style={{
        ...POSITION_MAP[direction],
        cursor: CURSOR_MAP[direction],
      }}
    />
  )
}
