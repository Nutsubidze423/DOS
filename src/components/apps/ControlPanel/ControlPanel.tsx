'use client'

import { useDesktopStore, WallpaperMode, ScreensaverMode } from '@/store/desktopStore'
import { useSoundStore } from '@/store/soundStore'
import { useAchievementStore } from '@/store/achievementStore'

const WALLPAPERS: { id: WallpaperMode; label: string; preview: string }[] = [
  { id: 'teal', label: 'Classic Teal', preview: '#008080' },
  { id: 'space', label: 'Deep Space', preview: '#050520' },
  { id: 'ocean', label: 'Ocean Deep', preview: '#003366' },
  { id: 'matrix', label: 'Matrix', preview: '#001400' },
  { id: 'dark', label: 'Midnight', preview: '#111118' },
]

const SCREENSAVERS: { id: ScreensaverMode; label: string; icon: string }[] = [
  { id: 'starfield', label: 'Starfield', icon: '✨' },
  { id: 'matrix', label: 'Matrix Rain', icon: '💚' },
]

export function ControlPanel() {
  const { wallpaper, setWallpaper, crtEnabled, toggleCRT, screensaverMode, setScreensaverMode } = useDesktopStore()
  const { muted, toggleMute } = useSoundStore()
  const { unlock } = useAchievementStore()

  return (
    <div className="flex flex-col h-full bg-os-chrome overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '2px solid var(--color-bevel-dark)', background: 'linear-gradient(90deg, #000080, #1084d0)' }}>
        <span className="text-[20px]">⚙️</span>
        <span className="font-ui text-white text-[14px] font-bold">Control Panel</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Wallpaper */}
        <div>
          <div className="font-ui text-[13px] font-bold text-black mb-2 pb-1" style={{ borderBottom: '1px solid var(--color-bevel-dark)' }}>
            🖼️ Desktop Background
          </div>
          <div className="grid grid-cols-5 gap-2">
            {WALLPAPERS.map(w => (
              <button
                key={w.id}
                onClick={() => { setWallpaper(w.id); unlock('wallpaper') }}
                className="flex flex-col items-center gap-1 p-1"
                style={{
                  border: '2px solid',
                  borderColor: wallpaper === w.id
                    ? 'var(--color-title-from)'
                    : 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
                  background: wallpaper === w.id ? 'rgba(0,0,128,0.1)' : 'transparent',
                }}
              >
                <div
                  className="w-[36px] h-[26px] rounded-sm"
                  style={{ background: w.preview, border: '1px solid #808080' }}
                />
                <span className="font-ui text-[9px] text-black text-center leading-tight">{w.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Display effects */}
        <div>
          <div className="font-ui text-[13px] font-bold text-black mb-2 pb-1" style={{ borderBottom: '1px solid var(--color-bevel-dark)' }}>
            🖥️ Display Effects
          </div>
          <label className="flex items-center gap-2 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={crtEnabled}
              onChange={toggleCRT}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="font-ui text-[12px] text-black">CRT Scanline effect</span>
            <span className="font-ui text-[10px] text-gray-500">(authentic retro look)</span>
          </label>
        </div>

        {/* Sound */}
        <div>
          <div className="font-ui text-[13px] font-bold text-black mb-2 pb-1" style={{ borderBottom: '1px solid var(--color-bevel-dark)' }}>
            🔊 Sound Settings
          </div>
          <label className="flex items-center gap-2 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={!muted}
              onChange={toggleMute}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="font-ui text-[12px] text-black">Enable system sounds</span>
          </label>
        </div>

        {/* Screensaver */}
        <div>
          <div className="font-ui text-[13px] font-bold text-black mb-2 pb-1" style={{ borderBottom: '1px solid var(--color-bevel-dark)' }}>
            🖥️ Screen Saver
          </div>
          <div className="flex gap-3">
            {SCREENSAVERS.map(s => (
              <button
                key={s.id}
                onClick={() => setScreensaverMode(s.id)}
                className="flex flex-col items-center gap-1 p-2"
                style={{
                  border: '2px solid',
                  borderColor: screensaverMode === s.id
                    ? 'var(--color-title-from)'
                    : 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
                  background: screensaverMode === s.id ? 'rgba(0,0,128,0.1)' : 'transparent',
                  minWidth: 70,
                }}
              >
                <div className="w-[48px] h-[32px] flex items-center justify-center text-[20px]"
                  style={{ background: '#000', border: '1px solid #808080' }}>
                  {s.icon}
                </div>
                <span className="font-ui text-[10px] text-black">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="font-ui text-[10px] text-gray-500 mt-1">Activates after 45 seconds of inactivity</div>
        </div>

        {/* About */}
        <div>
          <div className="font-ui text-[13px] font-bold text-black mb-2 pb-1" style={{ borderBottom: '1px solid var(--color-bevel-dark)' }}>
            ℹ️ About PortfolioOS
          </div>
          <div className="font-ui text-[11px] text-black space-y-1 p-2" style={{ background: 'white', border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)' }}>
            <div><strong>PortfolioOS 98 SE</strong></div>
            <div>Built by Demetre Nutsubidze</div>
            <div>Stack: Next.js 14 · TypeScript · Tailwind · Framer Motion</div>
            <div className="text-gray-500 pt-1">© 2026 Demetre Nutsubidze. All rights reserved.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
