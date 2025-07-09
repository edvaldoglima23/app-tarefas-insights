import { useTaskStore } from '../taskStore'
import { tasksAPI } from '../../services/api'
import type { Task } from '../../types'

// Mock da API
jest.mock('../../services/api', () => ({
  tasksAPI: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
    getStatistics: jest.fn(),
    getMotivationalQuote: jest.fn(),
  }
}))

const mockTasksAPI = tasksAPI as jest.Mocked<typeof tasksAPI>

// Dados de exemplo para os testes
const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Estudar React',
    description: 'Aprender sobre testes',
    status: 'pending',
    created_at: '2024-01-01T10:00:00Z',
    user: 1
  },
  {
    id: 2,
    title: 'Fazer exercícios',
    description: 'Praticar programação',
    status: 'completed',
    created_at: '2024-01-02T10:00:00Z',
    user: 1
  }
]

describe('TaskStore', () => {
  beforeEach(() => {
    // Limpa o estado da store antes de cada teste
    useTaskStore.setState({
      tasks: [],
      statistics: null,
      quote: null,
      filters: {
        search: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        ordering: '-created_at'
      },
      searchResults: null,
      loading: {
        tasks: false,
        statistics: false,
        quote: false,
        creating: false,
        updating: false,
        deleting: false
      },
      error: null
    })
    
    // Limpa todos os mocks
    jest.clearAllMocks()
  })

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      mockTasksAPI.getAll.mockResolvedValue(mockTasks)
      
      const store = useTaskStore.getState()
      await store.fetchTasks()
      
      expect(mockTasksAPI.getAll).toHaveBeenCalledTimes(1)
      
      const newState = useTaskStore.getState()
      expect(newState.tasks).toEqual(mockTasks)
      expect(newState.loading.tasks).toBe(false)
      expect(newState.error).toBeNull()
      
      console.log(`✓ Tasks fetched successfully: ${mockTasks.length} tasks loaded`)
    })

    it('should handle fetch tasks error', async () => {
      const errorMessage = 'Erro de conexão'
      mockTasksAPI.getAll.mockRejectedValue(new Error(errorMessage))
      
      const store = useTaskStore.getState()
      await store.fetchTasks()
      
      const newState = useTaskStore.getState()
      expect(newState.tasks).toEqual([])
      expect(newState.loading.tasks).toBe(false)
      expect(newState.error).toBe(errorMessage)
      
      console.log(`✓ Fetch tasks error handled: ${errorMessage}`)
    })
  })

  describe('createTask', () => {
    it('should create new task successfully', async () => {
      const newTaskData = {
        title: 'Nova tarefa',
        description: 'Descrição da nova tarefa',
        status: 'pending' as const
      }
      
      const createdTask: Task = {
        id: 3,
        ...newTaskData,
        created_at: '2024-01-03T10:00:00Z',
        user: 1
      }
      
      mockTasksAPI.create.mockResolvedValue(createdTask)
      mockTasksAPI.getStatistics.mockResolvedValue({
        total_tasks: 1,
        completed_tasks: 0,
        pending_tasks: 1,
        completion_rate: 0,
        tasks_today: 1,
        tasks_this_week: 1,
        tasks_this_month: 1,
        completed_today: 0,
        recent_tasks: []
      })
      
      const store = useTaskStore.getState()
      await store.createTask(newTaskData)
      
      expect(mockTasksAPI.create).toHaveBeenCalledWith(newTaskData)
      
      const newState = useTaskStore.getState()
      expect(newState.tasks).toContainEqual(createdTask)
      expect(newState.loading.creating).toBe(false)
      expect(newState.error).toBeNull()
      
      console.log(`Task created successfully: "${createdTask.title}"`)
    })

    it('should handle create task error', async () => {
      const newTaskData = {
        title: 'Nova tarefa',
        description: 'Descrição da nova tarefa',
        status: 'pending' as const
      }
      
      const errorMessage = 'Erro ao criar tarefa'
      mockTasksAPI.create.mockRejectedValue(new Error(errorMessage))
      
      const store = useTaskStore.getState()
      await store.createTask(newTaskData)
      
      const newState = useTaskStore.getState()
      expect(newState.tasks).toEqual([])
      expect(newState.loading.creating).toBe(false)
      expect(newState.error).toBe(errorMessage)
      
      console.log(`✓ Create task error handled: ${errorMessage}`)
    })
  })

  describe('setFilters', () => {
    it('deve atualizar filtros corretamente', () => {
      console.log('TESTE 5: Atualizando filtros...')
      
      const store = useTaskStore.getState()
      
      // Atualiza os filtros
      const newFilters = {
        search: 'React',
        status: 'pending'
      }
      
      store.setFilters(newFilters)
      
      // Verifica se os filtros foram atualizados
      const newState = useTaskStore.getState()
      expect(newState.filters.search).toBe('React')
      expect(newState.filters.status).toBe('pending')
      expect(newState.filters.ordering).toBe('-created_at') // Deve manter o valor anterior
      
      console.log('Filtros atualizados corretamente!')
    })
  })

  describe('clearFilters', () => {
    it('deve limpar filtros e buscar tarefas', async () => {
      console.log('TESTE 6: Limpando filtros...')
      
      // Mock da resposta da API
      mockTasksAPI.getAll.mockResolvedValue(mockTasks)
      
      const store = useTaskStore.getState()
      
      // Define alguns filtros primeiro
      store.setFilters({ search: 'React', status: 'pending' })
      
      // Limpa os filtros
      await store.clearFilters()
      
      // Verifica se os filtros foram resetados
      const newState = useTaskStore.getState()
      expect(newState.filters.search).toBe('')
      expect(newState.filters.status).toBe('')
      expect(newState.searchResults).toBeNull()
      
      // Verifica se fetchTasks foi chamado
      expect(mockTasksAPI.getAll).toHaveBeenCalledTimes(1)
      
      console.log('Filtros limpos e tarefas recarregadas!')
    })
  })

  describe('clearError', () => {
    it('deve limpar mensagem de erro', () => {
      console.log('TESTE 7: Limpando erro...')
      
      // Define um erro no estado
      useTaskStore.setState({ error: 'Erro de teste' })
      
      const store = useTaskStore.getState()
      
      // Limpa o erro
      store.clearError()
      
      // Verifica se o erro foi limpo
      const newState = useTaskStore.getState()
      expect(newState.error).toBeNull()
      
      console.log('Erro limpo com sucesso!')
    })
  })
}) 