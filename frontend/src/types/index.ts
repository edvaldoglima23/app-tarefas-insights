export interface Task {
  id: number
  title: string
  description: string
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
  user: number
}

export interface Statistics {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
  tasks_today: number
  tasks_this_week: number
  tasks_this_month: number
  completed_today: number
  recent_tasks: Task[]
}

export interface MotivationalQuote {
  content: string
  author: string
  tag: string
  success: boolean
  source?: string
  message?: string
}

export interface User {
  id: number
  username: string
  email?: string
}

export interface FilterOptions {
  search: string
  status: string
  dateFrom: string
  dateTo: string
  ordering: string
}

export interface SearchResults {
  results: Task[]
  count: number
  filters_applied: FilterOptions
} 