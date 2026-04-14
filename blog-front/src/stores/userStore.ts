import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User } from '../types/api'

interface UserState {
  token: string | null
  userInfo: User | null
  login: (token: string, userInfo: User) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        userInfo: null,
        login: (token, userInfo) => set({ token, userInfo }),
        logout: () => set({ token: null, userInfo: null }),
      }),
      { name: 'user-storage' }
    )
  )
)
