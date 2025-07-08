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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  // Buscar tarefas quando a página carregar
  useEffect(() => {
    fetchTasks()
  }, [])

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
      // Se der erro de autenticação, volta para login
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('token')
        router.push('/')
      }
    } finally {
      setLoading(false)
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
    } catch (err) {
      setError('Erro ao adicionar tarefa')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando tarefas...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🎯 Minhas Tarefas
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sair
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
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
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status === 'completed' ? 'Concluída' : 'Pendente'}
                    </span>
                    <div className="text-xs text-gray-500">
                      {new Date(task.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}