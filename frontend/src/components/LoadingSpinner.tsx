interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ 
  message = 'Carregando...', 
  size = 'md' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-blue-500 dark:border-blue-400 ${sizeClasses[size]}`}></div>
      {message && (
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{message}</p>
      )}
    </div>
  )
} 