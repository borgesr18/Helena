'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { errorHandler, ErrorCategory, ErrorSeverity } from '@/lib/errorHandler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errorId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Capturar o erro e gerar ID
    const userError = errorHandler.captureError(
      error,
      ErrorCategory.SYSTEM,
      ErrorSeverity.CRITICAL,
      {
        component: 'ErrorBoundary',
        type: 'render_error'
      }
    )

    return {
      hasError: true,
      errorId: userError.supportId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log adicional com informações do React
    errorHandler.captureError(
      error,
      ErrorCategory.SYSTEM,
      ErrorSeverity.CRITICAL,
      {
        component: 'ErrorBoundary',
        type: 'render_error',
        componentStack: errorInfo.componentStack
      }
    )
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI customizado ou padrão
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            
            <h1 className="text-lg font-semibold text-gray-900 mb-2">
              Oops! Algo deu errado
            </h1>
            
            <p className="text-gray-600 mb-4">
              Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada 
              e está trabalhando para corrigir o problema.
            </p>
            
            {this.state.errorId && (
              <p className="text-xs text-gray-500 mb-4">
                ID do erro: {this.state.errorId}
              </p>
            )}
            
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-helena-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Recarregar Página
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Se o problema persistir, entre em contato com o suporte
                técnico informando o ID do erro acima.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Componente funcional para casos específicos
interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  errorId?: string
}

export function ErrorFallback({ error, resetError, errorId }: ErrorFallbackProps) {
  return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro no Componente
        </h3>
        
        <p className="text-gray-600 mb-4">
          {error?.message || 'Ocorreu um erro inesperado neste componente.'}
        </p>
        
        {errorId && (
          <p className="text-xs text-gray-500 mb-4">
            ID: {errorId}
          </p>
        )}
        
        {resetError && (
          <button
            onClick={resetError}
            className="bg-helena-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  )
}

// Hook para capturar erros em componentes funcionais
export function useErrorBoundary() {
  return (error: Error) => {
    // Forçar re-render do ErrorBoundary
    throw error
  }
}