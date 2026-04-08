import { create } from 'zustand'

export type WallpaperMode = 'teal' | 'space' | 'ocean' | 'matrix' | 'dark'
export type ScreensaverMode = 'starfield' | 'matrix'

interface DesktopStoreState {
  wallpaper: WallpaperMode
  crtEnabled: boolean
  screensaverMode: ScreensaverMode
  setWallpaper: (w: WallpaperMode) => void
  toggleCRT: () => void
  setScreensaverMode: (m: ScreensaverMode) => void
}

export const useDesktopStore = create<DesktopStoreState>((set) => ({
  wallpaper: 'teal',
  crtEnabled: true,
  screensaverMode: 'starfield',
  setWallpaper: (wallpaper) => set({ wallpaper }),
  toggleCRT: () => set((s) => ({ crtEnabled: !s.crtEnabled })),
  setScreensaverMode: (screensaverMode) => set({ screensaverMode }),
}))
