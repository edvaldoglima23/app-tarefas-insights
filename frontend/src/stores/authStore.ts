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
      isAuthenticated: false, // Sempre começa como false
      loading: false,
      error: null,

      login: async (username: string, password: string) => {
        console.log('🔐 [AuthStore] Iniciando login:', { username })
        set({ loading: true, error: null })
        
        try {
          console.log('🌐 [AuthStore] Fazendo requisição para API...')
          const response = await authAPI.login(username, password)
          console.log('✅ [AuthStore] Resposta da API recebida:', response)
          
          const { access, refresh, user } = response
          
          localStorage.setItem('token', access)
          localStorage.setItem('refresh', refresh)
          console.log('💾 [AuthStore] Token salvo no localStorage')
          
          set({
            user,
            token: access,
            isAuthenticated: true,
            loading: false,
            error: null
          })
          
          console.log('🎉 [AuthStore] Login realizado com sucesso!', { user })
          return true
        } catch (error: any) {
          console.error('❌ [AuthStore] Erro no login:', error)
          console.error('📋 [AuthStore] Detalhes do erro:', {
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message
          })
          
          const errorMessage = error?.response?.data?.detail || 'Erro ao fazer login'
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
        
        // Se não tem token, não está autenticado
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
          const response = await fetch('https://web-production-02fc5.up.railway.app/api/auth/verify/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
          })
          
          if (response.ok) {
            // Token válido
            set({
              token,
              isAuthenticated: true,
              error: null
            })
          } else {
            // Token inválido
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
          // Erro de conexão - por segurança, considera não autenticado
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
        token: state.token
        // NÃO persiste isAuthenticated - sempre verifica
      })
    }
  )
) 