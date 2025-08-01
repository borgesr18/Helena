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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
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
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }, [])

  const calculateSimilarity = useCallback((str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }, [levenshteinDistance])

  const containsWakeWord = useCallback((text: string): boolean => {
    const normalized = normalizeText(text)
    const normalizedWakeWord = normalizeText(wakeWord)
    
    const words = normalized.split(/\s+/)
    return words.some(word => {
      if (word === normalizedWakeWord) return true
      
      const similarity = calculateSimilarity(word, normalizedWakeWord)
      return similarity > 0.8
    })
  }, [wakeWord, normalizeText, calculateSimilarity])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Reconhecimento de voz não é suportado neste navegador')
      return
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
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
        const lastResult = event.results[event.results.length - 1]
        const transcript = lastResult[0].transcript

        if (containsWakeWord(transcript)) {
          recognition.stop()
          onWake()
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setError(`Erro no reconhecimento de voz: ${event.error}`)
        setIsListening(false)

        if (continuous && ['no-speech', 'audio-capture', 'network'].includes(event.error)) {
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current) {
              startListening()
            }
          }, 1000)
        }
      }

      recognition.onend = () => {
        setIsListening(false)

        if (continuous && recognitionRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current) {
              startListening()
            }
          }, 100)
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error('Error starting speech recognition:', err)
      setError('Erro ao iniciar reconhecimento de voz')
    }
  }, [isSupported, language, containsWakeWord, onWake, continuous])

  const stopListening = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    
    setIsListening(false)
  }, [])

  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

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
