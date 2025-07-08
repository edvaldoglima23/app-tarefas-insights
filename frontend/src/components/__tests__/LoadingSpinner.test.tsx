import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('deve renderizar com mensagem padrão', () => {
    console.log('🧪 TESTE 1: Testando LoadingSpinner com mensagem padrão...')
    
    render(<LoadingSpinner />)
    
    // Verifica se a mensagem padrão aparece
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    
    // Verifica se o spinner está presente (procura pelo elemento com animação)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    
    console.log('✅ LoadingSpinner renderizado com mensagem padrão!')
  })

  it('deve renderizar com mensagem personalizada', () => {
    console.log('🧪 TESTE 2: Testando LoadingSpinner com mensagem personalizada...')
    
    const mensagemPersonalizada = 'Salvando tarefa...'
    render(<LoadingSpinner message={mensagemPersonalizada} />)
    
    // Verifica se a mensagem personalizada aparece
    expect(screen.getByText(mensagemPersonalizada)).toBeInTheDocument()
    
    // Verifica se a mensagem padrão NÃO aparece
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument()
    
    console.log('✅ LoadingSpinner renderizado com mensagem personalizada!')
  })

  it('deve renderizar com tamanhos diferentes', () => {
    console.log('🧪 TESTE 3: Testando LoadingSpinner com tamanhos diferentes...')
    
    const { rerender } = render(<LoadingSpinner size="sm" />)
    
    // Verifica tamanho pequeno
    let spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-4', 'w-4')
    
    // Testa tamanho médio
    rerender(<LoadingSpinner size="md" />)
    spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-8', 'w-8')
    
    // Testa tamanho grande
    rerender(<LoadingSpinner size="lg" />)
    spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-12', 'w-12')
    
    console.log('✅ LoadingSpinner funciona com todos os tamanhos!')
  })

  it('deve renderizar sem mensagem quando message for vazio', () => {
    console.log('🧪 TESTE 4: Testando LoadingSpinner sem mensagem...')
    
    render(<LoadingSpinner message="" />)
    
    // Verifica se não há texto de mensagem
    const messageElement = screen.queryByText(/carregando/i)
    expect(messageElement).not.toBeInTheDocument()
    
    // Mas o spinner ainda deve estar presente
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    
    console.log('✅ LoadingSpinner funciona sem mensagem!')
  })
}) 