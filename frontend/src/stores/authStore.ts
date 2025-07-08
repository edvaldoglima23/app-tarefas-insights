import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '@/services/api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

interface AuthActions {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await authAPI.login(username, password)
          const { access, refresh, user } = response
          
          localStorage.setItem('token', access)
          localStorage.setItem('refresh', refresh)
          
          set({
            user,
            token: access,
            isAuthenticated: true,
            loading: false,
            error: null
          })
          
          return true
        } catch (error: unknown) {
          const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Erro ao fazer login'
          set({
            loading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null
          })
          return false
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      clearError: () => set({ error: null }),

      setUser: (user: User) => set({ user })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
) 