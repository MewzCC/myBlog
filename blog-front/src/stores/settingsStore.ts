import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { SiteSettings } from '../types/api'

export type ThemeMode = 'light' | 'dark' | 'system'

interface SettingsState {
  theme: ThemeMode
  enableSakura: boolean
  enableUserEdit: boolean
  enableGuestbook: boolean
  enableSocials: boolean
  setTheme: (theme: ThemeMode) => void
  toggleSakura: (enable: boolean) => void
  toggleUserEdit: (enable: boolean) => void
  toggleGuestbook: (enable: boolean) => void
  toggleSocials: (enable: boolean) => void
  applyServerSettings: (settings: SiteSettings) => void
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'dark',
        enableSakura: true,
        enableUserEdit: false,
        enableGuestbook: true,
        enableSocials: true,
        setTheme: (theme) => set({ theme }),
        toggleSakura: (enable) => set({ enableSakura: enable }),
        toggleUserEdit: (enable) => set({ enableUserEdit: enable }),
        toggleGuestbook: (enable) => set({ enableGuestbook: enable }),
        toggleSocials: (enable) => set({ enableSocials: enable }),
        applyServerSettings: (settings) =>
          set({
            enableGuestbook: settings.enableGuestbook,
            enableUserEdit: settings.enableUserEdit,
            enableSocials: settings.enableSocials,
          }),
      }),
      { name: 'settings-storage' }
    )
  )
)
