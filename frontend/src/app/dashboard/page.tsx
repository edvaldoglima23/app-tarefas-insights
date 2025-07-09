'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Statistics {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
  tasks_today: number
  tasks_this_week: number
  tasks_this_month: number
  completed_today: number
  recent_tasks: Array<{
    id: number
    title: string
    status: string
    created_at: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await axios.get('http://localhost:8000/api/tasks/statistics/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setStats(response.data)
    } catch (err) {
      setError('Erro ao carregar estatísticas')
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('token')
        router.push('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const [exportingCSV, setExportingCSV] = useState(false)

  const handleExportCSV = async () => {
    setExportingCSV(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await axios.get('http://localhost:8000/api/tasks/export_csv/', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      })

      // Gerar nome do arquivo mais profissional
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
      const filename = `relatorio_tarefas_${dateStr}_${timeStr}.csv`

      // Criar URL temporária para o blob
      const url = window.URL.createObjectURL(response.data)
      
      // Criar link temporário para download
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpar URL temporária
      window.URL.revokeObjectURL(url)
      
      console.log(`✓ CSV exported successfully: ${filename}`)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      setError('Erro ao exportar relatório CSV')
    } finally {
      setExportingCSV(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-xl text-gray-900 dark:text-white">Carregando dashboard...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-xl text-red-500">Erro ao carregar dados</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📊 Dashboard de Tarefas
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/tasks')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Ver Tarefas
              </button>
              <button
                onClick={handleExportCSV}
                disabled={exportingCSV}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exportar relatório completo de tarefas em formato CSV"
              >
                {exportingCSV ? '⏳ Gerando...' : '📊 Exportar Relatório'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                📝
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Total de Tarefas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_tasks}</p>
              </div>
            </div>
          </div>

          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                ✅
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Concluídas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed_tasks}</p>
              </div>
            </div>
          </div>

          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                ⏰
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending_tasks}</p>
              </div>
            </div>
          </div>

          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                📈
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completion_rate}%</p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📅 Hoje</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-slate-300">Tarefas criadas: <span className="font-bold">{stats.tasks_today}</span></p>
              <p className="text-sm text-gray-600 dark:text-slate-300">Tarefas concluídas: <span className="font-bold">{stats.completed_today}</span></p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📆 Esta Semana</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-slate-300">Tarefas criadas: <span className="font-bold">{stats.tasks_this_week}</span></p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🗓️ Este Mês</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-slate-300">Tarefas criadas: <span className="font-bold">{stats.tasks_this_month}</span></p>
            </div>
          </div>
        </div>

        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🕐 Tarefas Recentes</h3>
          <div className="space-y-3">
            {stats.recent_tasks.length === 0 ? (
              <p className="text-gray-500 dark:text-slate-400 text-center py-4">Nenhuma tarefa encontrada</p>
            ) : (
              stats.recent_tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {new Date(task.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {task.status === 'completed' ? 'Concluída' : 'Pendente'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 