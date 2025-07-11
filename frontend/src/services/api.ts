import axios from 'axios'
import type { Task, Statistics, MotivationalQuote, FilterOptions, SearchResults } from '@/types'

// FORÇAR SEMPRE RAILWAY - CORREÇÃO DEFINITIVA
const API_BASE_URL = 'https://web-production-02fc5.up.railway.app/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
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
    try {
      // Usa PATCH para atualizações parciais ao invés de PUT
      const response = await api.patch(`/tasks/${id}/`, task)
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}/`)
  },

  getStatistics: async (): Promise<Statistics> => {
    try {
      const response = await api.get('/tasks/statistics/')
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  getMotivationalQuote: async (): Promise<MotivationalQuote> => {
    try {
      const response = await api.get('/tasks/motivacional/')
      return response.data
    } catch (error: any) {
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