import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  'konami':       { id: 'konami',       title: 'Cheat Code Entered', desc: 'You found the legendary Konami code',    icon: '🎮' },
  'guestbook':    { id: 'guestbook',    title: 'Social Butterfly',   desc: 'Left a message for Demetre',             icon: '✍️' },
  'wallpaper':    { id: 'wallpaper',    title: 'Interior Decorator', desc: 'Changed the desktop wallpaper',          icon: '🖼️' },
  'solitaire-win':{ id: 'solitaire-win',title: 'Card Shark',         desc: 'Won a game of Solitaire',                icon: '♠️' },
  'explorer':     { id: 'explorer',     title: 'Window Hoarder',     desc: 'Opened 6 windows simultaneously',        icon: '🗂️' },
}

interface AchievementStore {
  unlocked: string[]
  pending: Achievement | null
  unlock: (id: string) => void
  dismissPending: () => void
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlocked: [],
      pending: null,
      unlock: (id) => {
        if (get().unlocked.includes(id)) return
        const achievement = ACHIEVEMENTS[id]
        if (!achievement) return
        set((s) => ({ unlocked: [...s.unlocked, id], pending: achievement }))
        setTimeout(() => {
          set((s) => s.pending?.id === id ? { ...s, pending: null } : s)
        }, 5000)
      },
      dismissPending: () => set({ pending: null }),
    }),
    { name: 'portfolioOS_achievements' }
  )
)
