// Sistema robusto de tratamento de erros e logging
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  NETWORK = 'network',
  SPEECH_RECOGNITION = 'speech_recognition',
  FILE_OPERATION = 'file_operation',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  UNKNOWN = 'unknown'
}

export interface ErrorInfo {
  id: string
  message: string
  category: ErrorCategory
  severity: ErrorSeverity
  timestamp: Date
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  ip?: string
  stack?: string
  context?: Record<string, unknown>
  isRetryable?: boolean
}

export interface UserFriendlyError {
  message: string
  code: string
  canRetry: boolean
  supportId?: string
}

class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: ErrorInfo[] = []
  private maxLogSize = 1000

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Método principal para capturar e processar erros
  captureError(
    error: Error | unknown,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, unknown>
  ): UserFriendlyError {
    const errorId = this.generateErrorId()
    
    const errorInfo: ErrorInfo = {
      id: errorId,
      message: this.extractErrorMessage(error),
      category,
      severity,
      timestamp: new Date(),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      isRetryable: this.isRetryableError(error, category)
    }

    // Adicionar contexto do navegador se disponível
    if (typeof window !== 'undefined') {
      errorInfo.url = window.location.href
      errorInfo.userAgent = navigator.userAgent
    }

    // Log do erro
    this.logError(errorInfo)

    // Gerar resposta amigável para o usuário
    return this.generateUserFriendlyError(errorInfo)
  }

  // Wrapper para async functions com tratamento automático de erro
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    category: ErrorCategory,
    context?: Record<string, unknown>
  ): Promise<{ success: true; data: T } | { success: false; error: UserFriendlyError }> {
    try {
      const result = await operation()
      return { success: true, data: result }
    } catch (error) {
      const userError = this.captureError(error, category, ErrorSeverity.HIGH, context)
      return { success: false, error: userError }
    }
  }

  // Método para capturar erros não tratados globalmente
  setupGlobalErrorHandling(): void {
    if (typeof window === 'undefined') return

    // Capturar erros JavaScript não tratados
    window.addEventListener('error', (event) => {
      this.captureError(
        new Error(event.message),
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      )
    })

    // Capturar promises rejeitadas não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason,
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        {
          type: 'unhandled_promise_rejection'
        }
      )
    })
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    
    if (typeof error === 'string') {
      return error
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message)
    }
    
    return 'Erro desconhecido'
  }

  private isRetryableError(error: unknown, category: ErrorCategory): boolean {
    const message = this.extractErrorMessage(error).toLowerCase()
    
    // Erros de rede geralmente são retryable
    if (category === ErrorCategory.NETWORK) {
      return true
    }

    // Erros específicos que podem ser tentados novamente
    const retryableMessages = [
      'network error',
      'timeout',
      'connection failed',
      'service unavailable',
      'internal server error',
      'bad gateway',
      'gateway timeout'
    ]

    return retryableMessages.some(msg => message.includes(msg))
  }

  private generateUserFriendlyError(errorInfo: ErrorInfo): UserFriendlyError {
    let userMessage: string
    let errorCode: string

    switch (errorInfo.category) {
      case ErrorCategory.AUTHENTICATION:
        userMessage = 'Problema de autenticação. Por favor, faça login novamente.'
        errorCode = 'AUTH_ERROR'
        break
      
      case ErrorCategory.AUTHORIZATION:
        userMessage = 'Você não tem permissão para realizar esta ação.'
        errorCode = 'PERMISSION_ERROR'
        break
      
      case ErrorCategory.VALIDATION:
        userMessage = 'Os dados fornecidos são inválidos. Verifique e tente novamente.'
        errorCode = 'VALIDATION_ERROR'
        break
      
      case ErrorCategory.DATABASE:
        userMessage = 'Erro ao acessar dados. Tente novamente em alguns instantes.'
        errorCode = 'DATABASE_ERROR'
        break
      
      case ErrorCategory.NETWORK:
        userMessage = 'Problema de conexão. Verifique sua internet e tente novamente.'
        errorCode = 'NETWORK_ERROR'
        break
      
      case ErrorCategory.SPEECH_RECOGNITION:
        userMessage = 'Erro no reconhecimento de voz. Verifique as permissões do microfone.'
        errorCode = 'SPEECH_ERROR'
        break
      
      case ErrorCategory.EXTERNAL_API:
        userMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.'
        errorCode = 'SERVICE_ERROR'
        break
      
      default:
        userMessage = 'Ocorreu um erro inesperado. Nossa equipe foi notificada.'
        errorCode = 'UNKNOWN_ERROR'
    }

    return {
      message: userMessage,
      code: errorCode,
      canRetry: errorInfo.isRetryable || false,
      supportId: errorInfo.id
    }
  }

  private logError(errorInfo: ErrorInfo): void {
    // Log no console para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${errorInfo.severity.toUpperCase()}] - ${errorInfo.category}`)
      console.error('Message:', errorInfo.message)
      console.error('ID:', errorInfo.id)
      console.error('Timestamp:', errorInfo.timestamp.toISOString())
      if (errorInfo.context) {
        console.error('Context:', errorInfo.context)
      }
      if (errorInfo.stack) {
        console.error('Stack:', errorInfo.stack)
      }
      console.groupEnd()
    }

    // Adicionar ao log interno
    this.errorLog.unshift(errorInfo)
    
    // Manter apenas os últimos erros
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorInfo)
    }
  }

  private async sendToMonitoringService(errorInfo: ErrorInfo): Promise<void> {
    try {
      // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
      // Por agora, vamos apenas fazer um log estruturado
      
      const logData = {
        level: 'error',
        message: errorInfo.message,
        category: errorInfo.category,
        severity: errorInfo.severity,
        errorId: errorInfo.id,
        timestamp: errorInfo.timestamp.toISOString(),
        context: errorInfo.context,
        url: errorInfo.url,
        userAgent: errorInfo.userAgent
      }

      // Exemplo de como enviar para um endpoint de logging
      if (typeof fetch !== 'undefined') {
        await fetch('/api/logging/error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        }).catch(() => {
          // Falha silenciosa para não gerar loop de erros
        })
      }
    } catch {
      // Falha silenciosa para evitar loops de erro
    }
  }

  // Métodos de conveniência para diferentes tipos de erro
  authenticationError(error: unknown, context?: Record<string, unknown>): UserFriendlyError {
    return this.captureError(error, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, context)
  }

  validationError(error: unknown, context?: Record<string, unknown>): UserFriendlyError {
    return this.captureError(error, ErrorCategory.VALIDATION, ErrorSeverity.MEDIUM, context)
  }

  networkError(error: unknown, context?: Record<string, unknown>): UserFriendlyError {
    return this.captureError(error, ErrorCategory.NETWORK, ErrorSeverity.HIGH, context)
  }

  databaseError(error: unknown, context?: Record<string, unknown>): UserFriendlyError {
    return this.captureError(error, ErrorCategory.DATABASE, ErrorSeverity.CRITICAL, context)
  }

  speechRecognitionError(error: unknown, context?: Record<string, unknown>): UserFriendlyError {
    return this.captureError(error, ErrorCategory.SPEECH_RECOGNITION, ErrorSeverity.MEDIUM, context)
  }

  // Utilitários
  getRecentErrors(limit: number = 50): ErrorInfo[] {
    return this.errorLog.slice(0, limit)
  }

  getErrorStats(): { total: number; bySeverity: Record<string, number>; byCategory: Record<string, number> } {
    const total = this.errorLog.length
    const bySeverity: Record<string, number> = {}
    const byCategory: Record<string, number> = {}

    this.errorLog.forEach(error => {
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
      byCategory[error.category] = (byCategory[error.category] || 0) + 1
    })

    return { total, bySeverity, byCategory }
  }

  clearErrorLog(): void {
    this.errorLog = []
  }
}

// Instância singleton
export const errorHandler = ErrorHandler.getInstance()

// Hook para componentes React
export function useErrorHandler() {
  return {
    captureError: errorHandler.captureError.bind(errorHandler),
    executeWithErrorHandling: errorHandler.executeWithErrorHandling.bind(errorHandler),
    authenticationError: errorHandler.authenticationError.bind(errorHandler),
    validationError: errorHandler.validationError.bind(errorHandler),
    networkError: errorHandler.networkError.bind(errorHandler),
    databaseError: errorHandler.databaseError.bind(errorHandler),
    speechRecognitionError: errorHandler.speechRecognitionError.bind(errorHandler)
  }
}

// Configurar tratamento global de erros na inicialização da app
export function initializeErrorHandling() {
  errorHandler.setupGlobalErrorHandling()
}