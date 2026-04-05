'use client'

import { useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore } from '@/store/windowStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { TitleBar } from './TitleBar'
import { ResizeHandle } from './ResizeHandle'
import { AppId } from '@/types'

type AppComponent = React.ComponentType

const AppComponents: Record<AppId, React.LazyExoticComponent<AppComponent>> = {
  'about-me': lazy(() => import('@/components/apps/AboutMe/AboutMe').then(m => ({ default: m.AboutMe }))),
  'projects': lazy(() => import('@/components/apps/Projects/Projects').then(m => ({ default: m.Projects }))),
  'skills': lazy(() => import('@/components/apps/Skills/Skills').then(m => ({ default: m.Skills }))),
  'terminal': lazy(() => import('@/components/apps/Terminal/Terminal').then(m => ({ default: m.Terminal }))),
  'resume': lazy(() => import('@/components/apps/Resume/Resume').then(m => ({ default: m.Resume }))),
  'contact': lazy(() => import('@/components/apps/Contact/Contact').then(m => ({ default: m.Contact }))),
  'recycle-bin': lazy(() => import('@/components/apps/RecycleBin/RecycleBin').then(m => ({ default: m.RecycleBin }))),
}

const DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const

interface WindowProps {
  id: string
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 }

const TASKBAR_HEIGHT = 40

export function Window({ id }: WindowProps) {
  const { windows, focusWindow } = useWindowStore()
  const reducedMotion = useReducedMotion()
  const win = windows[id]

  const activeWindowId = Object.values(windows).reduce<string | null>(
    (topId, w) => (!topId || w.zIndex > (windows[topId]?.zIndex ?? 0) ? w.id : topId),
    null
  )
  const isActive = activeWindowId === id

  const handleFocus = useCallback(() => focusWindow(id), [id, focusWindow])

  if (!win || !win.isMounted) return null

  const AppComponent = AppComponents[win.appId]

  const maximizedStyle = {
    x: 0,
    y: 0,
    width: '100vw',
    height: `calc(100vh - ${TASKBAR_HEIGHT}px)`,
  }

  const normalStyle = {
    x: win.position.x,
    y: win.position.y,
    width: win.size.width,
    height: win.size.height,
  }

  return (
    <AnimatePresence>
      {!win.isMinimized && (
        <motion.div
          key={id}
          className="absolute flex flex-col overflow-hidden"
          style={{
            zIndex: win.zIndex,
            border: '2px solid',
            borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
            boxShadow: isActive
              ? '3px 3px 12px rgba(0,0,0,0.6), 0 0 20px rgba(0,100,255,0.1)'
              : '3px 3px 8px rgba(0,0,0,0.4)',
          }}
          initial={reducedMotion ? false : { scale: 0.85, opacity: 0 }}
          animate={win.isMaximized ? maximizedStyle : { ...normalStyle, scale: 1, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { scale: 0.85, opacity: 0 }}
          transition={reducedMotion ? { duration: 0 } : SPRING}
          onPointerDown={handleFocus}
          layout
        >
          <TitleBar id={id} title={win.title} isActive={isActive} />
          <div className="flex-1 overflow-hidden bg-os-chrome relative">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full font-terminal text-black text-lg">
                  Loading...
                </div>
              }
            >
              <AppComponent />
            </Suspense>
          </div>
          {!win.isMaximized &&
            DIRECTIONS.map((dir) => (
              <ResizeHandle key={dir} id={id} direction={dir} />
            ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
