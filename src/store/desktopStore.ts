import { create } from 'zustand'

export type WallpaperMode = 'teal' | 'space' | 'ocean' | 'matrix' | 'dark'

interface DesktopStoreState {
  wallpaper: WallpaperMode
  crtEnabled: boolean
  setWallpaper: (w: WallpaperMode) => void
  toggleCRT: () => void
}

export const useDesktopStore = create<DesktopStoreState>((set) => ({
  wallpaper: 'teal',
  crtEnabled: true,
  setWallpaper: (wallpaper) => set({ wallpaper }),
  toggleCRT: () => set((s) => ({ crtEnabled: !s.crtEnabled })),
}))
