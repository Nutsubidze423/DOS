import { Howl } from 'howler'

type SoundName = 'startup' | 'window-open' | 'window-close' | 'error' | 'start-menu' | 'minimize'

let sounds: Partial<Record<SoundName, Howl>> | null = null

export function initSounds(): void {
  if (typeof window === 'undefined') return
  if (sounds) return

  sounds = {
    startup: new Howl({ src: ['/sounds/startup.mp3'], volume: 0.6 }),
    'window-open': new Howl({ src: ['/sounds/window-open.mp3'], volume: 0.4 }),
    'window-close': new Howl({ src: ['/sounds/window-close.mp3'], volume: 0.3 }),
    error: new Howl({ src: ['/sounds/error.mp3'], volume: 0.5 }),
    'start-menu': new Howl({ src: ['/sounds/start-menu.mp3'], volume: 0.3 }),
    minimize: new Howl({ src: ['/sounds/minimize.mp3'], volume: 0.3 }),
  }
}

export function playSound(name: SoundName, muted: boolean): void {
  if (muted || typeof window === 'undefined') return
  if (!sounds) initSounds()
  sounds?.[name]?.play()
}
