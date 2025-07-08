'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Task {
  id: number
  title: string
  description: string
  status: string
  created_at: string
}

interface Statistics {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
  tasks_today: number
  tasks_this_week: number
  tasks_this_month: number
  completed_today: number
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<Statistics | null>(null)
  const [newTask, setNewTask] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  // Buscar tarefas e estatísticas quando a página carregar
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchTasks(), fetchStatistics()])
  }

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await axios.get('http://localhost:8000/api/tasks/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setTasks(response.data)
    } catch (err) {
      setError('Erro ao carregar tarefas')
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('token')
        router.push('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get('http://localhost:8000/api/tasks/statistics/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setStats(response.data)
    } catch (err) {
      console.log('Erro ao carregar estatísticas:', err)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:8000/api/tasks/', {
        title: newTask,
        description: newDescription,
        status: 'pending'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setTasks([...tasks, response.data])
      setNewTask('')
      setNewDescription('')
      // Atualizar estatísticas após criar tarefa
      fetchStatistics()
    } catch (err) {
      setError('Erro ao adicionar tarefa')
    }
  }

  // UPDATE - Atualizar tarefa
  const handleUpdateTask = async (task: Task) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`http://localhost:8000/api/tasks/${task.id}/`, {
        title: task.title,
        description: task.description,
        status: task.status
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setTasks(tasks.map(t => t.id === task.id ? response.data : t))
      setEditingTask(null)
      // Atualizar estatísticas após atualizar tarefa
      fetchStatistics()
    } catch (err) {
      setError('Erro ao atualizar tarefa')
    }
  }

  // DELETE - Excluir tarefa
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8000/api/tasks/${taskId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setTasks(tasks.filter(t => t.id !== taskId))
      // Atualizar estatísticas após excluir tarefa
      fetchStatistics()
    } catch (err) {
      setError('Erro ao excluir tarefa')
    }
  }

  // Alternar status da tarefa
  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending'
    await handleUpdateTask({ ...task, status: newStatus })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              🎯 Minhas Tarefas & Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sair
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Seção de Tarefas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Gerenciar Tarefas</h2>
          
          {/* Formulário para adicionar tarefa */}
          <form onSubmit={handleAddTask} className="mb-6">
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Título da tarefa..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descrição da tarefa..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Adicionar Tarefa
              </button>
            </div>
          </form>

          {/* Lista de tarefas */}
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Nenhuma tarefa encontrada. Crie sua primeira tarefa!
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="p-4 bg-gray-50 rounded-md border">
                  {editingTask?.id === task.id ? (
                    // Modo de edição
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingTask.title}
                        onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                        className="w-full px-3 py-2 border rounded text-gray-900"
                      />
                      <textarea
                        value={editingTask.description}
                        onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                        className="w-full px-3 py-2 border rounded text-gray-900"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateTask(editingTask)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo de visualização
                    <>
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status === 'completed' ? 'Concluída' : 'Pendente'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleStatus(task)}
                            className={`px-3 py-1 text-white text-sm rounded ${
                              task.status === 'completed'
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {task.status === 'completed' ? 'Reabrir' : 'Concluir'}
                          </button>
                          <button
                            onClick={() => setEditingTask(task)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(task.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Seção de Estatísticas */}
        {stats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Suas Estatísticas</h2>
            
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total de Tarefas */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 text-xl">
                    📝
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-xl font-bold text-gray-900">{stats.total_tasks}</p>
                  </div>
                </div>
              </div>

              {/* Tarefas Concluídas */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 text-xl">
                    ✅
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Concluídas</p>
                    <p className="text-xl font-bold text-gray-900">{stats.completed_tasks}</p>
                  </div>
                </div>
              </div>

              {/* Tarefas Pendentes */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 text-xl">
                    ⏰
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-xl font-bold text-gray-900">{stats.pending_tasks}</p>
                  </div>
                </div>
              </div>

              {/* Taxa de Conclusão */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600 text-xl">
                    📈
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Taxa</p>
                    <p className="text-xl font-bold text-gray-900">{stats.completion_rate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">📅 Hoje: <span className="font-bold">{stats.tasks_today} criadas, {stats.completed_today} concluídas</span></p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">📆 Esta semana: <span className="font-bold">{stats.tasks_this_week} tarefas</span></p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">🗓️ Este mês: <span className="font-bold">{stats.tasks_this_month} tarefas</span></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}