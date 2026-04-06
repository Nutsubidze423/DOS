import { Howl } from 'howler'

type SoundName = 'startup' | 'window-open' | 'window-close' | 'error' | 'start-menu' | 'minimize'

let sounds: Partial<Record<SoundName, Howl>> | null = null

export function initSounds(): void {
  if (typeof window === 'undefined') return
  if (sounds) return

  sounds = {
    startup: new Howl({ src: ['/sounds/startup.wav'], volume: 0.6 }),
    'window-open': new Howl({ src: ['/sounds/window-open.wav'], volume: 0.4 }),
    'window-close': new Howl({ src: ['/sounds/window-close.wav'], volume: 0.3 }),
    error: new Howl({ src: ['/sounds/error.wav'], volume: 0.5 }),
    'start-menu': new Howl({ src: ['/sounds/start-menu.wav'], volume: 0.3 }),
    minimize: new Howl({ src: ['/sounds/minimize.wav'], volume: 0.3 }),
  }
}

export function playSound(name: SoundName, muted: boolean): void {
  if (muted || typeof window === 'undefined') return
  if (!sounds) initSounds()
  sounds?.[name]?.play()
}
