import { create } from 'zustand'

interface PresenceStore {
  onlineCount: number
  setOnlineCount: (n: number) => void
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  onlineCount: 0,
  setOnlineCount: (onlineCount) => set({ onlineCount }),
}))
