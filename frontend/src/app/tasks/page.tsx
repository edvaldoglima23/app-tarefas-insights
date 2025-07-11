'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/types';

export default function TasksPage() {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const { 
    tasks, 
    loading, 
    error, 
    fetchTasks, 
    createTask, 
    updateTask, 
    deleteTask, 
    toggleTaskStatus,
    clearError,
    quote,
    fetchQuote
  } = useTaskStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: ''
  });

  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    fetchTasks();
    fetchQuote();
  }, [isAuthenticated, router, fetchTasks, fetchQuote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      alert('Título é obrigatório');
      return;
    }

    if (editingTask) {
      await updateTask(editingTask.id, newTask);
    } else {
      await createTask({
        title: newTask.title,
        description: newTask.description,
        status: 'pending'
      });
    }

    setNewTask({ title: '', description: '' });
    setShowForm(false);
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || ''
    });
    setShowForm(true);
    
    
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleToggleStatus = async (task: Task) => {
    await toggleTaskStatus(task);
  };

  const handleDelete = async (taskId: number) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(taskId);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesSearch = !filters.search || 
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  if (loading.tasks && tasks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-300">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Banner de Frase Motivacional */}
        {quote && (
          <div className="bg-gradient-to-r from-green-500 to-blue-600 dark:from-green-600 dark:to-blue-700 rounded-lg shadow-md p-6 mb-6 text-white">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✨</div>
              <div className="flex-1">
                <blockquote className="text-lg font-medium italic mb-2">
                  "{quote.content}"
                </blockquote>
                <cite className="text-green-100 dark:text-green-200 text-sm">
                  — {quote.author}
                </cite>
                {!quote.success && quote.message && (
                  <p className="text-green-100 dark:text-green-200 text-xs mt-1">
                    {quote.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {loading.quote && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                )}
                <button
                  onClick={fetchQuote}
                  disabled={loading.quote}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-md text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Buscar nova frase motivacional"
                >
                  {loading.quote ? '⏳' : '🔄'} Nova Frase
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📋 Gerenciar Tarefas
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-center"
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (!showForm) {
                    
                    setTimeout(() => {
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                    }, 100);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
              >
                {showForm ? 'Cancelar' : 'Nova Tarefa'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-center"
              >
                Sair
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 flex justify-between items-center">
              {error}
              <button onClick={clearError} className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">✕</button>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    placeholder="Título da tarefa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Descrição da tarefa"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading.creating || loading.updating}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {loading.creating || loading.updating ? 'Salvando...' : (editingTask ? 'Atualizar' : 'Criar')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                    setNewTask({ title: '', description: '' });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🔍 Filtros e Busca</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Buscar tarefas..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendentes</option>
                  <option value="completed">Concluídas</option>
                </select>
              </div>

              <div>
                <button
                  onClick={() => setFilters({ status: '', search: '' })}
                  className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-slate-400 text-lg">
                  {tasks.length === 0 ? 'Nenhuma tarefa criada ainda' : 'Nenhuma tarefa encontrada com os filtros aplicados'}
                </p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => handleToggleStatus(task)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.status === 'completed'
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 dark:border-slate-500 hover:border-green-500'
                          }`}
                        >
                          {task.status === 'completed' && '✓'}
                        </button>
                        
                        <h3 className={`text-lg font-medium ${
                          task.status === 'completed' 
                            ? 'line-through text-gray-500 dark:text-slate-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {task.title}
                        </h3>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' 
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300' 
                            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-300'
                        }`}>
                          {task.status === 'completed' ? '✅ Concluída' : '⏳ Pendente'}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 dark:text-slate-300 mb-2 ml-9">{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 ml-9">
                        <span>Criada: {new Date(task.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Editar tarefa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Excluir tarefa"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 