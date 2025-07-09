import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    
    console.log('✓ LoadingSpinner rendered with default message')
  })

  it('should render with custom message', () => {
    const customMessage = 'Salvando tarefa...'
    render(<LoadingSpinner message={customMessage} />)
    
    expect(screen.getByText(customMessage)).toBeInTheDocument()
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument()
    
    console.log('✓ LoadingSpinner rendered with custom message')
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    
    let spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-4', 'w-4')
    
    rerender(<LoadingSpinner size="md" />)
    spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-8', 'w-8')
    
    rerender(<LoadingSpinner size="lg" />)
    spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-12', 'w-12')
    
    console.log('✓ LoadingSpinner supports all size variants: sm, md, lg')
  })

  it('should render without message when message is empty', () => {
    render(<LoadingSpinner message="" />)
    
    const messageElement = screen.queryByText(/carregando/i)
    expect(messageElement).not.toBeInTheDocument()
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    
    console.log('✓ LoadingSpinner renders without message when empty string provided')
  })
}) 