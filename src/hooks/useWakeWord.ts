'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseWakeWordOptions {
  wakeWord: string
  onWake: () => void
  continuous?: boolean
  language?: string
}

interface UseWakeWordReturn {
  isListening: boolean
  isSupported: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
}

export function useWakeWord({
  wakeWord = 'helena',
  onWake,
  continuous = true,
  language = 'pt-BR'
}: UseWakeWordOptions): UseWakeWordReturn {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Verificar se estamos no lado do cliente
    if (typeof window === 'undefined') {
      setIsSupported(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const isAPISupported = !!SpeechRecognition
    
    setIsSupported(isAPISupported)
    
    if (!isAPISupported) {
      setError('Reconhecimento de voz não é suportado neste navegador')
    }
  }, [])

  const normalizeText = useCallback((text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .trim()
  }, [])

  const levenshteinDistance = useCallback((str1: string, str2: string): number => {
    const matrix: number[][] = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }, [])

  const isSimilar = useCallback((text: string, target: string): boolean => {
    const normalizedText = normalizeText(text)
    const normalizedTarget = normalizeText(target)
    
    // Exact match
    if (normalizedText.includes(normalizedTarget)) {
      return true
    }
    
    // Fuzzy match using Levenshtein distance
    const words = normalizedText.split(/\s+/)
    
    for (const word of words) {
      const distance = levenshteinDistance(word, normalizedTarget)
      const similarity = 1 - (distance / Math.max(word.length, normalizedTarget.length))
      
      if (similarity >= 0.7) { // 70% similarity threshold
        return true
      }
    }
    
    return false
  }, [normalizeText, levenshteinDistance])

  const startRecognition = useCallback(() => {
    // Verificação adicional para SSR
    if (typeof window === 'undefined') {
      const errorMsg = 'Reconhecimento de voz não disponível no servidor'
      setError(errorMsg)
      return
    }

    if (!isSupported) {
      setError('Reconhecimento de voz não é suportado neste navegador')
      return
    }

    try {
      // Clean up existing recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
        restartTimeoutRef.current = null
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        throw new Error('SpeechRecognition API não encontrada')
      }
      
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = language
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript.trim()

          if (transcript && isSimilar(transcript, wakeWord)) {
            console.log(`Wake word "${wakeWord}" detected in: "${transcript}"`)
            onWake()
            
            if (!continuous) {
              recognition.stop()
              return
            }
          }
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('Wake word recognition error:', event.error)
        
        // Handle specific errors
        if (event.error === 'not-allowed') {
          setError('Permissão para usar o microfone foi negada')
          setIsListening(false)
          return
        }
        
        if (event.error === 'audio-capture') {
          setError('Erro ao capturar áudio. Verifique as permissões do microfone.')
          setIsListening(false)
          return
        }

        // For other errors, try to restart if continuous mode is enabled
        if (continuous && isListening) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isListening) {
              startRecognition()
            }
          }, 1000)
        } else {
          setIsListening(false)
        }
      }

      recognition.onend = () => {
        if (continuous && isListening) {
          // Automatically restart recognition after a short delay
          restartTimeoutRef.current = setTimeout(() => {
            if (isListening) {
              startRecognition()
            }
          }, 100)
        } else {
          setIsListening(false)
        }
      }

      recognitionRef.current = recognition
      recognition.start()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao iniciar reconhecimento de wake word'
      console.error('Error starting wake word recognition:', error)
      setError(errorMessage)
      setIsListening(false)
    }
  }, [isSupported, language, wakeWord, onWake, continuous, isSimilar, isListening])

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    
    startRecognition()
  }, [startRecognition])

  const stopListening = useCallback(() => {
    setIsListening(false)
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening
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
