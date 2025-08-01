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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
  }, [])

  const startListening = useCallback(() => {
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
            timeoutRef.current = setTimeout(() => {
              recognition.stop()
            }, timeout)
          }
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Voice command recognition error:', event.error)
        const errorMessage = `Erro na captura do comando: ${event.error}`
        setError(errorMessage)
        setIsListening(false)
        
        if (onError) {
          onError(errorMessage)
        }

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }

      recognition.onend = () => {
        setIsListening(false)

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        const finalResult = finalTranscriptRef.current.trim()
        if (finalResult.length > 0) {
          onResult(finalResult)
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error('Error starting voice command recognition:', err)
      const errorMsg = 'Erro ao iniciar captura de comando de voz'
      setError(errorMsg)
      if (onError) {
        onError(errorMsg)
      }
    }
  }, [isSupported, language, timeout, onResult, onError])

  const stopListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    
    setIsListening(false)
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    finalTranscriptRef.current = ''
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

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
