import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TokenResponseDto } from '@/types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  // Actions
  setTokens: (tokens: TokenResponseDto) => void
  clearTokens: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,

      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),

      clearTokens: () =>
        set({
          accessToken: null,
          refreshToken: null,
        }),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'cinx-auth', // key trong localStorage
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist token, không persist computed functions
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
