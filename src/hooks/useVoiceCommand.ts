'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVoiceCommandOptions {
  language?: string
  timeout?: number
  onResult: (transcript: string) => void
  onError?: (error: string) => void
}

interface UseVoiceCommandReturn {
  isListening: boolean
  isSupported: boolean
  transcript: string
  error: string | null
  startListening: () => void
  stopListening: () => void
  clearTranscript: () => void
}

export function useVoiceCommand({
  language = 'pt-BR',
  timeout = 10000,
  onResult,
  onError
}: UseVoiceCommandOptions): UseVoiceCommandReturn {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    // Verificar se estamos no lado do cliente (browser)
    if (typeof window === 'undefined') {
      setIsSupported(false)
      return
    }

    // Verificar se SpeechRecognition está disponível
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const isAPISupported = !!SpeechRecognition
    
    setIsSupported(isAPISupported)
    
    if (!isAPISupported) {
      setError('Reconhecimento de voz não é suportado neste navegador')
    }
  }, [])

  const startListening = useCallback(() => {
    // Verificação adicional para evitar erros durante SSR
    if (typeof window === 'undefined') {
      const errorMsg = 'Reconhecimento de voz não disponível no servidor'
      setError(errorMsg)
      if (onError) {
        onError(errorMsg)
      }
      return
    }

    if (!isSupported) {
      const errorMsg = 'Reconhecimento de voz não é suportado neste navegador'
      setError(errorMsg)
      if (onError) {
        onError(errorMsg)
      }
      return
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        throw new Error('SpeechRecognition API não encontrada')
      }
      
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = language
      recognition.maxAlternatives = 3

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        setTranscript('')
        finalTranscriptRef.current = ''

        timeoutRef.current = setTimeout(() => {
          recognition.stop()
        }, timeout)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = ''
        let finalTranscript = finalTranscriptRef.current

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript

          if (result.isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        finalTranscriptRef.current = finalTranscript
        const fullTranscript = finalTranscript + interimTranscript
        setTranscript(fullTranscript.trim())

        if (finalTranscript.trim().length > 0) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          recognition.stop()
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        const finalText = finalTranscriptRef.current.trim()
        if (finalText.length > 0) {
          onResult(finalText)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false)
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        let errorMessage = 'Erro no reconhecimento de voz'
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Nenhuma fala detectada. Tente falar mais alto ou verificar o microfone.'
            break
          case 'audio-capture':
            errorMessage = 'Erro ao capturar áudio. Verifique as permissões do microfone.'
            break
          case 'not-allowed':
            errorMessage = 'Permissão para usar o microfone foi negada.'
            break
          case 'network':
            errorMessage = 'Erro de rede durante o reconhecimento de voz.'
            break
          case 'service-not-allowed':
            errorMessage = 'Serviço de reconhecimento de voz não permitido.'
            break
          case 'bad-grammar':
            errorMessage = 'Erro na configuração de gramática.'
            break
          case 'language-not-supported':
            errorMessage = `Idioma ${language} não é suportado.`
            break
          default:
            errorMessage = `Erro no reconhecimento de voz: ${event.error}`
        }
        
        setError(errorMessage)
        if (onError) {
          onError(errorMessage)
        }
      }

      recognitionRef.current = recognition
      recognition.start()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao iniciar reconhecimento de voz'
      setError(errorMessage)
      setIsListening(false)
      
      if (onError) {
        onError(errorMessage)
      }
    }
  }, [isSupported, language, timeout, onResult, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    setIsListening(false)
  }, [isListening])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    finalTranscriptRef.current = ''
    setError(null)
  }, [])

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    clearTranscript
  }
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onstart: ((event: Event) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: ((event: Event) => void) | null
  start(): void
  stop(): void
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new(): SpeechRecognition
    }
  }
}
