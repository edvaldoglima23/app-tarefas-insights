'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/types'

export default function TasksPage() {
  const [newTask, setNewTask] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()
  const {
    tasks,
    statistics: stats,
    quote,
    filters,
    searchResults,
    loading,
    error,
    fetchTasks,
    searchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    fetchStatistics,
    fetchQuote,
    setFilters,
    clearFilters,
    clearError
  } = useTaskStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }
    
    const initializeData = async () => {
      await Promise.all([fetchTasks(), fetchStatistics(), fetchQuote()])
    }
    
    initializeData()
  }, [isAuthenticated, router])

  const handleSearch = () => {
    searchTasks(filters)
  }

  const handleClearFilters = () => {
    clearFilters()
  }



  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    await createTask({
      title: newTask,
      description: newDescription,
      status: 'pending'
    })
    
    setNewTask('')
    setNewDescription('')
  }

  const handleUpdateTask = async (task: Task) => {
    await updateTask(task.id, {
      title: task.title,
      description: task.description,
      status: task.status
    })
    setEditingTask(null)
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return
    await deleteTask(taskId)
  }

  const handleToggleStatus = async (task: Task) => {
    console.log('🔄 Toggle iniciado para tarefa:', task.id, 'Status atual:', task.status)
    
    try {
      await toggleTaskStatus(task)
      console.log('✅ Toggle concluído com sucesso!')
    } catch (error) {
      console.error('❌ Erro no toggle:', error)
      alert(`Erro ao alterar status: ${error}`)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (loading.tasks) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <>
      {/* Barra de Frase Motivacional */}
      {quote && (
        <div className="fixed top-0 left-0 w-full z-40 bg-purple-50 border-b border-purple-200 text-center flex items-center justify-center py-2 px-4 shadow-sm">
          <span className="text-purple-700 text-base font-medium flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="italic max-w-[60vw] truncate">&ldquo;{quote.content}&rdquo;</span>
            <span className="text-sm text-purple-500 ml-2">— {quote.author}</span>
            <button
              onClick={fetchQuote}
              disabled={loading.quote}
              className="ml-4 px-2 py-1 rounded hover:bg-purple-100 text-purple-700 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title="Nova frase"
            >
              {loading.quote ? '⏳' : '🔄'}
            </button>
          </span>
        </div>
      )}

      <div className="pt-5">
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
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                {error}
                <button onClick={clearError} className="ml-2 text-red-500 hover:text-red-700">✕</button>
              </div>
            )}

            {/* Gerenciar Tarefas */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Gerenciar Tarefas</h2>
              
              {/* Formulário Nova Tarefa */}
              <form onSubmit={handleAddTask} className="mb-6">
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Título da tarefa..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Descrição (opcional)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading.creating}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading.creating ? 'Adicionando...' : 'Adicionar Tarefa'}
                  </button>
                </div>
              </form>

              {/* Filtros e Busca */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros e Busca</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buscar:</label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ search: e.target.value })}
                      placeholder="Digite para buscar..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Todos</option>
                      <option value="pending">Pendente</option>
                      <option value="completed">Concluída</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data De:</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ dateFrom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Até:</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ dateTo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar:</label>
                    <select
                      value={filters.ordering}
                      onChange={(e) => setFilters({ ordering: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="-created_at">Data ↓ (Recente)</option>
                      <option value="created_at">Data ↑ (Antiga)</option>
                      <option value="title">Título A-Z</option>
                      <option value="-title">Título Z-A</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Buscar
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Limpar
                  </button>
                </div>
                
                {searchResults && (
                  <div className="mt-4 text-sm text-gray-600">
                    Encontradas {searchResults.count} tarefas
                    {Object.values(searchResults.filters_applied).some(v => v) && 
                      ' com os filtros aplicados'
                    }
                  </div>
                )}
              </div>

              {/* Lista de Tarefas */}
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchResults ? 'Nenhuma tarefa encontrada com os filtros aplicados' : 'Nenhuma tarefa criada ainda'}
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {editingTask?.id === task.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                          <textarea
                            value={editingTask.description}
                            onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateTask(editingTask)}
                              disabled={loading.updating}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                            >
                              {loading.updating ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button
                              onClick={() => setEditingTask(null)}
                              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className={`text-sm mt-1 ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Criada: {new Date(task.created_at).toLocaleString('pt-BR')}</span>
                              <span className={`px-2 py-1 rounded-full text-white ${
                                task.status === 'completed' ? 'bg-green-500' : 
                                task.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}>
                                {task.status === 'completed' ? '✅ Concluída' : 
                                 task.status === 'pending' ? '⏳ Pendente' : '❌ Cancelada'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleToggleStatus(task)}
                              disabled={loading.updating}
                              className={`px-3 py-1 rounded text-white ${
                                task.status === 'pending' 
                                  ? 'bg-green-500 hover:bg-green-600' 
                                  : 'bg-yellow-500 hover:bg-yellow-600'
                              } disabled:opacity-50 transition-all duration-200`}
                              title={`${task.status === 'pending' ? 'Marcar como concluída' : 'Marcar como pendente'} | ID: ${task.id}`}
                            >
                              {loading.updating ? '⏳' : task.status === 'pending' ? '✅' : '↩️'}
                            </button>
                            <button
                              onClick={() => setEditingTask(task)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              disabled={loading.deleting}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                            >
                              {loading.deleting ? '...' : '🗑️'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dashboard de Estatísticas */}
            {stats && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">📊 Dashboard & Insights</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900">📝 Total de Tarefas</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.total_tasks}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900">✅ Concluídas</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.completed_tasks}</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-900">⏳ Pendentes</h3>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending_tasks}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900">📈 Taxa de Conclusão</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats.completion_rate}%</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-900">📅 Hoje</h3>
                    <p className="text-3xl font-bold text-indigo-600">{stats.tasks_today}</p>
                  </div>
                  
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-pink-900">📆 Esta Semana</h3>
                    <p className="text-3xl font-bold text-pink-600">{stats.tasks_this_week}</p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-900">📊 Este Mês</h3>
                    <p className="text-3xl font-bold text-red-600">{stats.tasks_this_month}</p>
                  </div>
                  
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-900">🎯 Finalizadas Hoje</h3>
                    <p className="text-3xl font-bold text-teal-600">{stats.completed_today}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </>
  )
} 