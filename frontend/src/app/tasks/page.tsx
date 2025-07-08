'use client'

import { useState, useEffect } from 'react'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui vamos conectar com nossa API depois!
    console.log('Nova tarefa:', newTask)
    setNewTask('')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🎯 Minhas Tarefas
          </h1>
          
          {/* Formulário para adicionar tarefa */}
          <form onSubmit={handleAddTask} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Digite uma nova tarefa..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Adicionar
              </button>
            </div>
          </form>

          {/* Lista de tarefas */}
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-md border">
              <h3 className="font-semibold text-gray-900">Exemplo de Tarefa</h3>
              <p className="text-gray-600 text-sm">Esta é uma tarefa de exemplo!</p>
              <div className="mt-2 flex gap-2">
                <button className="px-3 py-1 bg-green-500 text-white text-sm rounded">
                  Concluir
                </button>
                <button className="px-3 py-1 bg-red-500 text-white text-sm rounded">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}