import { create } from 'zustand'
import { BootPhase } from '@/types'

interface BootStoreState {
  phase: BootPhase
  skipped: boolean
  setPhase: (phase: BootPhase) => void
  skip: () => void
}

export const useBootStore = create<BootStoreState>((set) => ({
  phase: 'idle',
  skipped: false,
  setPhase: (phase) => set({ phase }),
  skip: () => set({ phase: 'done', skipped: true }),
}))
