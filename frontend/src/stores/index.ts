import { useAuthStore } from './authStore'
import { useTaskStore } from './taskStore'

export { useAuthStore, useTaskStore }

export const useStores = () => ({
  auth: useAuthStore(),
  tasks: useTaskStore()
}) 