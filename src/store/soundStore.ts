import { create } from 'zustand'

interface SoundStoreState {
  muted: boolean
  toggleMute: () => void
}

export const useSoundStore = create<SoundStoreState>((set) => ({
  muted: false,
  toggleMute: () => set((state) => ({ muted: !state.muted })),
}))
