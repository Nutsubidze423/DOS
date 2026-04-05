'use client'

import { useCallback } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { playSound } from '@/lib/sounds'

type SoundName = 'startup' | 'window-open' | 'window-close' | 'error' | 'start-menu' | 'minimize'

export function useSoundEffect() {
  const { muted } = useSoundStore()

  const play = useCallback(
    (name: SoundName) => {
      playSound(name, muted)
    },
    [muted]
  )

  return { play }
}
