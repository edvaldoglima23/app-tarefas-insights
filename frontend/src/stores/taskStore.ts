import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { tasksAPI } from '@/services/api'
import type { Task, Statistics, MotivationalQuote, FilterOptions, SearchResults } from '@/types'

interface TaskState {
  tasks: Task[]
  statistics: Statistics | null
  quote: MotivationalQuote | null
  filters: FilterOptions
  searchResults: SearchResults | null
  loading: {
    tasks: boolean
    searching: boolean
    statistics: boolean
    quote: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
  }
  error: string | null
}

interface TaskActions {
  fetchTasks: () => Promise<void>
  searchTasks: (filters?: Partial<FilterOptions>) => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'created_at' | 'user'>) => Promise<void>
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  toggleTaskStatus: (task: Task) => Promise<void>
  fetchStatistics: () => Promise<void>
  fetchQuote: () => Promise<void>
  exportTasksCSV: () => Promise<void>
  setFilters: (filters: Partial<FilterOptions>) => void
  clearFilters: () => void
  clearError: () => void
}

const initialFilters: FilterOptions = {
  search: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  ordering: '-created_at'
}

export const useTaskStore = create<TaskState & TaskActions>()(
  immer((set, get) => ({
    tasks: [],
    statistics: null,
    quote: null,
    filters: initialFilters,
    searchResults: null,
    loading: {
      tasks: false,
      searching: false,
      statistics: false,
      quote: false,
      creating: false,
      updating: false,
      deleting: false
    },
    error: null,

    fetchTasks: async () => {
      set((state) => {
        state.loading.tasks = true
        state.error = null
      })

      try {
        const tasks = await tasksAPI.getAll()
        set((state) => {
          state.tasks = tasks
          state.loading.tasks = false
          state.searchResults = null
        })
      } catch (error: any) {
        set((state) => {
          state.loading.tasks = false
          state.error = error.message || 'Erro ao carregar tarefas'
        })
      }
    },

    searchTasks: async (filters) => {
      const currentFilters = filters ? { ...get().filters, ...filters } : get().filters
      
      set((state) => {
        state.loading.searching = true
        state.error = null
        state.filters = currentFilters
      })

      try {
        const results = await tasksAPI.search(currentFilters)
        set((state) => {
          state.tasks = results.results
          state.searchResults = results
          state.loading.searching = false
        })
      } catch (error: any) {
        set((state) => {
          state.loading.searching = false
          state.error = error.message || 'Erro ao buscar tarefas'
        })
      }
    },

    createTask: async (taskData) => {
      set((state) => {
        state.loading.creating = true
        state.error = null
      })

      try {
        const newTask = await tasksAPI.create(taskData)
        set((state) => {
          state.tasks.unshift(newTask)
          state.loading.creating = false
        })
        
        get().fetchStatistics()
      } catch (error: any) {
        set((state) => {
          state.loading.creating = false
          state.error = error.message || 'Erro ao criar tarefa'
        })
      }
    },

    updateTask: async (id, updates) => {
      console.log('updateTask chamado:', { id, updates })
      
      set((state) => {
        state.loading.updating = true
        state.error = null
      })

      try {
        const updatedTask = await tasksAPI.update(id, updates)
        console.log('Tarefa atualizada no backend:', updatedTask)
        
        set((state) => {
          const index = state.tasks.findIndex(task => task.id === id)
          if (index !== -1) {
            console.log('Atualizando tarefa no estado local, índice:', index)
            state.tasks[index] = updatedTask
          } else {
            console.warn('Tarefa não encontrada no estado local!')
          }
          state.loading.updating = false
        })
        
        await get().fetchStatistics()
        console.log('Estatísticas atualizadas')
      } catch (error: any) {
        console.error('Erro ao atualizar tarefa:', error)
        set((state) => {
          state.loading.updating = false
          state.error = error.message || 'Erro ao atualizar tarefa'
        })
      }
    },

    deleteTask: async (id) => {
      set((state) => {
        state.loading.deleting = true
        state.error = null
      })

      try {
        await tasksAPI.delete(id)
        set((state) => {
          state.tasks = state.tasks.filter(task => task.id !== id)
          state.loading.deleting = false
        })
        
        get().fetchStatistics()
      } catch (error: any) {
        set((state) => {
          state.loading.deleting = false
          state.error = error.message || 'Erro ao excluir tarefa'
        })
      }
    },

    toggleTaskStatus: async (task) => {
      console.log('toggleTaskStatus chamado para tarefa:', task)
      const newStatus: 'pending' | 'completed' = task.status === 'pending' ? 'completed' : 'pending'
      console.log('Mudando status de', task.status, 'para', newStatus)
      
      // Atualização otimista: atualiza o estado primeiro
      set((state) => {
        const index = state.tasks.findIndex(t => t.id === task.id)
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], status: newStatus }
        }
        state.loading.updating = true
        state.error = null
      })

      try {
        // Depois confirma com o backend - apenas o status
        console.log('📤 Enviando apenas status para API:', { status: newStatus })
        const updatedTask = await tasksAPI.update(task.id, { status: newStatus })
        console.log('✅ Status atualizado no backend:', updatedTask)
        
        // Confirma a atualização com os dados do backend
        set((state) => {
          const index = state.tasks.findIndex(t => t.id === task.id)
          if (index !== -1) {
            state.tasks[index] = updatedTask
          }
          state.loading.updating = false
        })
        
        // Atualiza estatísticas
        await get().fetchStatistics()
        console.log('Status atualizado com sucesso!')
      } catch (error) {
        console.error('Erro ao atualizar status, revertendo:', error)
        
        // Reverte a mudança otimista em caso de erro
        set((state) => {
          const index = state.tasks.findIndex(t => t.id === task.id)
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], status: task.status }
          }
          state.loading.updating = false
          state.error = 'Erro ao atualizar status da tarefa'
        })
        throw error
      }
    },

    fetchStatistics: async () => {
      set((state) => {
        state.loading.statistics = true
      })

      try {
        const statistics = await tasksAPI.getStatistics()
        set((state) => {
          state.statistics = statistics
          state.loading.statistics = false
        })
      } catch (error: any) {
        set((state) => {
          state.loading.statistics = false
        })
      }
    },

    fetchQuote: async () => {
      set((state) => {
        state.loading.quote = true
      })

      try {
        const quote = await tasksAPI.getMotivationalQuote()
        set((state) => {
          state.quote = quote
          state.loading.quote = false
        })
      } catch (error: any) {
        set((state) => {
          state.loading.quote = false
          state.quote = {
            content: 'Você é capaz de mais do que imagina!',
            author: 'Inspiração Local',
            tag: 'motivational',
            success: false,
            message: 'Frase offline'
          }
        })
      }
    },

    exportTasksCSV: async () => {
      set((state) => {
        state.loading.tasks = true
        state.error = null
      })

      try {
        const blob = await tasksAPI.exportCSV()
        
        
        const now = new Date()
        const dateStr = now.toISOString().split('T')[0]
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
        const filename = `relatorio_tarefas_${dateStr}_${timeStr}.csv`
        
       
        const url = window.URL.createObjectURL(blob)
        
        
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        
        window.URL.revokeObjectURL(url)
        
        set((state) => {
          state.loading.tasks = false
        })
        
        console.log(`✓ CSV exported successfully: ${filename}`)
      } catch (error: any) {
        set((state) => {
          state.loading.tasks = false
          state.error = error.message || 'Erro ao exportar relatório CSV'
        })
        console.error('Error exporting CSV:', error)
      }
    },

    setFilters: (newFilters) => {
      set((state) => {
        state.filters = { ...state.filters, ...newFilters }
      })
    },

    clearFilters: async () => {
      set((state) => {
        state.loading.searching = true
        state.filters = initialFilters
        state.searchResults = null
        state.error = null
      })
      
      try {
        const tasks = await tasksAPI.getAll()
        set((state) => {
          state.tasks = tasks
          state.loading.searching = false
        })
      } catch (error: any) {
        set((state) => {
          state.loading.searching = false
          state.error = error.message || 'Erro ao carregar tarefas'
        })
      }
    },

    clearError: () => {
      set((state) => {
        state.error = null
      })
    }
  }))
) 