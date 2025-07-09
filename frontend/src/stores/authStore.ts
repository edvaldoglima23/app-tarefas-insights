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
  checkAuthStatus: () => Promise<void>
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

      setUser: (user: User) => set({ user }),

      checkAuthStatus: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          })
          return
        }

        try {
          const response = await fetch('http://localhost:8000/api/tasks/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.status === 401) {
            // Token inválido ou expirado
            localStorage.removeItem('token')
            localStorage.removeItem('refresh')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null
            })
          } else if (response.status === 200) {
            // Token válido - confirmar autenticação
            set({
              token,
              isAuthenticated: true,
              error: null
            })
          }
        } catch (error) {
          // Erro de conexão - limpar autenticação por segurança
          console.log('Erro ao verificar token:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('refresh')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          })
        }
      }
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