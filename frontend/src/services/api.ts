import axios from 'axios'
import type { Task, Statistics, MotivationalQuote, FilterOptions, SearchResults } from '@/types'

// FORÇAR SEMPRE RAILWAY - CORREÇÃO DEFINITIVA
const API_BASE_URL = 'https://web-production-02fc5.up.railway.app/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  console.log('🌐 [API] Fazendo requisição:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullUrl: `${config.baseURL || ''}${config.url || ''}`
  })
  
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('🔑 [API] Token adicionado ao header')
  } else {
    console.log('⚠️ [API] Nenhum token encontrado')
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Resposta recebida:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('❌ [API] Erro na resposta:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    })
    
    if (error.response?.status === 401) {
      console.log('🚪 [API] Token inválido - redirecionando para login')
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/token/', { username, password })
    return response.data
  },
  
  refresh: async (refresh: string) => {
    const response = await api.post('/token/refresh/', { refresh })
    return response.data
  }
}

export const tasksAPI = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/')
    return response.data
  },

  search: async (filters: Partial<FilterOptions>): Promise<SearchResults> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key === 'search' ? 'q' : key, value)
    })
    
    const url = params.toString() ? `/tasks/search/?${params}` : '/tasks/'
    const response = await api.get(url)
    
    return response.data.results ? response.data : { 
      results: response.data, 
      count: response.data.length, 
      filters_applied: filters as FilterOptions 
    }
  },

  create: async (task: Omit<Task, 'id' | 'created_at' | 'user'>): Promise<Task> => {
    const response = await api.post('/tasks/', task)
    return response.data
  },

  update: async (id: number, task: Partial<Task>): Promise<Task> => {
    console.log('🔧 API update chamada:', { id, task })
    console.log('🌐 URL completa:', `${API_BASE_URL}/tasks/${id}/`)
    console.log('📦 Payload sendo enviado:', JSON.stringify(task))
    
    try {
      // Usa PATCH para atualizações parciais ao invés de PUT
      const response = await api.patch(`/tasks/${id}/`, task)
      console.log('✅ Resposta da API update:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Erro na API update:')
      console.error('Status:', error.response?.status)
      console.error('Data:', error.response?.data)
      console.error('Headers:', error.response?.headers)
      throw error
    }
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}/`)
  },

  getStatistics: async (): Promise<Statistics> => {
    console.log('📊 [API] Buscando estatísticas do dashboard...')
    try {
      const response = await api.get('/tasks/statistics/')
      console.log('✅ [API] Estatísticas recebidas:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ [API] Erro ao buscar estatísticas:', error)
      console.error('📋 [API] Detalhes do erro:', {
        status: error?.response?.status,
        data: error?.response?.data,
        url: error?.config?.url
      })
      throw error
    }
  },

  getMotivationalQuote: async (): Promise<MotivationalQuote> => {
    console.log('💬 [API] Buscando frase motivacional...')
    try {
      const response = await api.get('/tasks/motivacional/')
      console.log('✅ [API] Frase motivacional recebida:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ [API] Erro ao buscar frase motivacional:', error)
      console.error('📋 [API] Detalhes do erro:', {
        status: error?.response?.status,
        data: error?.response?.data,
        url: error?.config?.url
      })
      throw error
    }
  },

  exportCSV: async (): Promise<Blob> => {
    const response = await api.get('/tasks/export_csv/', {
      responseType: 'blob'
    })
    return response.data
  }
}

export default api 