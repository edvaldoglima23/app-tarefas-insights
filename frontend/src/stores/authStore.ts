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
        
        // Se não há token, definitivamente não está autenticado
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
          // Tenta fazer uma requisição para verificar se o token é válido
          const response = await fetch('http://localhost:8000/api/tasks/', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.status === 200) {
            // Token válido - usuário está autenticado
            set({
              token,
              isAuthenticated: true,
              error: null
            })
          } else {
            // Token inválido, expirado ou qualquer outro erro de autenticação
            localStorage.removeItem('token')
            localStorage.removeItem('refresh')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null
            })
          }
        } catch (error) {
          // Erro de conexão ou servidor - por segurança, consideramos não autenticado
          console.log('Erro ao verificar autenticação:', error)
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