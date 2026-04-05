import { create } from 'zustand'
import { AppId, WindowState } from '@/types'
import { WINDOW_CONFIGS } from '@/lib/windowConfigs'

interface WindowStoreState {
  windows: Record<string, WindowState>
  zCounter: number
  openWindow: (appId: AppId) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void
  updatePosition: (id: string, position: { x: number; y: number }) => void
  updateSize: (id: string, size: { width: number; height: number }) => void
}

const STAGGER_OFFSET = 24

export const useWindowStore = create<WindowStoreState>((set, get) => ({
  windows: {},
  zCounter: 10,

  openWindow: (appId) => {
    const { windows, zCounter } = get()

    // If already open, just focus it
    const existing = Object.values(windows).find(
      (w) => w.appId === appId && !w.isMinimized
    )
    if (existing) {
      get().focusWindow(existing.id)
      return
    }

    // If minimized, restore it
    const minimized = Object.values(windows).find(
      (w) => w.appId === appId && w.isMinimized
    )
    if (minimized) {
      get().restoreWindow(minimized.id)
      return
    }

    const config = WINDOW_CONFIGS[appId]
    const openCount = Object.keys(windows).length
    const id = `${appId}-${Date.now()}`
    const newZCounter = zCounter + 1

    const newWindow: WindowState = {
      id,
      appId,
      title: config.title,
      isMinimized: false,
      isMaximized: false,
      position: {
        x: config.position.x + openCount * STAGGER_OFFSET,
        y: config.position.y + openCount * STAGGER_OFFSET,
      },
      size: config.size,
      zIndex: newZCounter,
      isMounted: true,
    }

    set({
      windows: { ...windows, [id]: newWindow },
      zCounter: newZCounter,
    })
  },

  closeWindow: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.windows
      return { windows: rest }
    })
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isMinimized: true },
      },
    }))
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isMaximized: true, isMinimized: false },
      },
    }))
  },

  restoreWindow: (id) => {
    // Restoring clears isMaximized intentionally — a minimized window always
    // returns to normal (not maximized) state.
    const { zCounter } = get()
    const newZ = zCounter + 1
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isMinimized: false,
          isMaximized: false,
          zIndex: newZ,
        },
      },
      zCounter: newZ,
    }))
  },

  focusWindow: (id) => {
    const { zCounter } = get()
    const newZ = zCounter + 1
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], zIndex: newZ },
      },
      zCounter: newZ,
    }))
  },

  updatePosition: (id, position) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], position },
      },
    }))
  },

  updateSize: (id, size) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], size },
      },
    }))
  },
}))
