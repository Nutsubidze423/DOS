'use client'

import { useCallback } from 'react'
import { useWindowStore } from '@/store/windowStore'
import { useWindowDrag } from '@/hooks/useWindowDrag'

interface TitleBarProps {
  id: string
  title: string
  isActive: boolean
}

export function TitleBar({ id, title, isActive }: TitleBarProps) {
  const { minimizeWindow, maximizeWindow, restoreWindow, closeWindow, windows } =
    useWindowStore()
  const { bind } = useWindowDrag(id)
  const win = windows[id]

  const handleMaxRestore = useCallback(() => {
    if (win?.isMaximized) restoreWindow(id)
    else maximizeWindow(id)
  }, [id, win?.isMaximized, maximizeWindow, restoreWindow])

  return (
    <div
      {...bind()}
      className="flex items-center justify-between h-[26px] px-[3px] select-none touch-none"
      style={{
        background: isActive
          ? 'linear-gradient(90deg, #000080, #1084d0)'
          : 'linear-gradient(90deg, #555, #888)',
        cursor: 'move',
      }}
      onDoubleClick={handleMaxRestore}
    >
      <div className="flex items-center gap-[5px] overflow-hidden">
        <span className="font-ui text-white text-[11px] font-bold truncate">
          {title}
        </span>
      </div>
      <div className="flex gap-[3px] flex-shrink-0">
        {/* Minimize */}
        <button
          className="w-[18px] h-[16px] bg-os-chrome bevel-raised flex items-center justify-center text-[10px] font-bold text-black leading-none hover:bg-os-chrome-light"
          onClick={(e) => { e.stopPropagation(); minimizeWindow(id) }}
          aria-label="Minimize"
        >
          _
        </button>
        {/* Maximize / Restore */}
        <button
          className="w-[18px] h-[16px] bg-os-chrome bevel-raised flex items-center justify-center text-[10px] font-bold text-black leading-none hover:bg-os-chrome-light"
          onClick={(e) => { e.stopPropagation(); handleMaxRestore() }}
          aria-label={win?.isMaximized ? 'Restore' : 'Maximize'}
        >
          {win?.isMaximized ? '❐' : '□'}
        </button>
        {/* Close */}
        <button
          className="w-[18px] h-[16px] bg-os-chrome bevel-raised flex items-center justify-center text-[10px] font-bold text-black leading-none hover:bg-red-600 hover:text-white"
          onClick={(e) => { e.stopPropagation(); closeWindow(id) }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
