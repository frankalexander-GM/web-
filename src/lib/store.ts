import { create } from 'zustand'

export type ViewKey = 'home' | 'communities' | 'chat' | 'streams' | 'store' | 'profile'

export interface CurrentUser {
  id: string
  username: string
  displayName: string
  avatar: string | null
  banner: string | null
  bio: string | null
  isStreamer: boolean
  level: number
  xp: number
  coins: number
  frameId: string | null
}

interface AppState {
  view: ViewKey
  profileUserId: string | null
  currentUser: CurrentUser | null
  setView: (v: ViewKey) => void
  openProfile: (userId: string) => void
  setCurrentUser: (u: CurrentUser | null) => void
  refreshUser: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'home',
  profileUserId: null,
  currentUser: null,
  setView: (v) => set({ view: v }),
  openProfile: (userId) => set({ view: 'profile', profileUserId: userId }),
  setCurrentUser: (u) => set({ currentUser: u }),
  refreshUser: async () => {
    try {
      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        set({ currentUser: data.user })
      }
    } catch {
      /* ignore */
    }
  },
}))
