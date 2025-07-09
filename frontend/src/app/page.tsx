'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  
  const { login, loading, error, isAuthenticated, clearError, checkAuthStatus } = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true)
      await checkAuthStatus()
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [checkAuthStatus])

  useEffect(() => {
    // Só redireciona se não estiver verificando e estiver autenticado
    if (!isCheckingAuth && isAuthenticated) {
      router.push('/tasks')
    }
  }, [isAuthenticated, router, isCheckingAuth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    const success = await login(username, password)
    if (success) {
      router.push('/tasks')
    }
  }

  // Mostra loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-slate-300">Verificando login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            🎯 App de Tarefas
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-300">
            Faça login para ver suas tarefas
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                placeholder="Digite seu usuário"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                placeholder="Digite sua senha"
                required
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:ring-offset-slate-800"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
              className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 underline"
            >
              Limpar sessão e recarregar
            </button>
          </div>
        </form>           
      </div>
    </div>
  )
}