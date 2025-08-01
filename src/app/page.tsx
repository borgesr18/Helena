'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Mic, FileText, PenTool, CheckCircle, Users, Clock, Lightbulb, Brain, Loader2 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useWakeWord } from '@/hooks/useWakeWord'
import { useVoiceCommand } from '@/hooks/useVoiceCommand'
import { PrescricaoData } from '@/types/prescription'

export default function Home() {
  const [isAssistantActive, setIsAssistantActive] = useState(false)
  const [transcriptionText, setTranscriptionText] = useState('Aguardando ativação da assistente...')
  const [voiceCommand, setVoiceCommand] = useState('')
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [prescricaoData, setPrescricaoData] = useState<PrescricaoData | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const handleVoiceCommandResult = useCallback((transcript: string) => {
    console.log('Voice command captured:', transcript)
    setVoiceCommand(transcript)
    setTranscriptionText(`Comando capturado: ${transcript}`)
  }, [])

  const {
    isListening: isCommandListening,
    isSupported: isCommandSupported,
    transcript: commandTranscript,
    error: commandError,
    startListening: startVoiceCommand,
    stopListening: stopVoiceCommand,
    clearTranscript
  } = useVoiceCommand({
    language: 'pt-BR',
    timeout: 10000,
    onResult: handleVoiceCommandResult,
    onError: (error) => console.error('Voice command error:', error)
  })

  const handleWakeWordDetected = useCallback(() => {
    console.log('Wake word "Helena" detected!')
    startVoiceCommand()
  }, [startVoiceCommand])

  const {
    isListening: isWakeWordListening,
    isSupported: isWakeWordSupported,
    error: wakeWordError,
    startListening: startWakeWord,
    stopListening: stopWakeWord
  } = useWakeWord({
    wakeWord: 'helena',
    onWake: handleWakeWordDetected,
    continuous: true,
    language: 'pt-BR'
  })

  const handleActivateAssistant = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsAssistantActive(true)
      setTranscriptionText('Helena está ouvindo por "Helena"...')
      startWakeWord()
    } catch (error) {
      console.error('Microphone permission denied:', error)
      setTranscriptionText('Erro: Permissão do microfone negada')
    }
  }, [startWakeWord])

  const handleDeactivateAssistant = useCallback(() => {
    setIsAssistantActive(false)
    setTranscriptionText('Assistente desativada')
    stopWakeWord()
    stopVoiceCommand()
    clearTranscript()
  }, [stopWakeWord, stopVoiceCommand, clearTranscript])

  const handleProcessWithAI = useCallback(async () => {
    if (!voiceCommand.trim()) {
      setAiError('Nenhum comando de voz disponível para processar')
      return
    }

    setIsProcessingAI(true)
    setAiError(null)
    setPrescricaoData(null)

    try {
      const response = await fetch('/api/openai/prescricao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcricao: voiceCommand
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao processar comando com IA')
      }

      const data: PrescricaoData = await response.json()
      setPrescricaoData(data)
      setTranscriptionText(`IA processou: ${voiceCommand}`)
    } catch (error) {
      console.error('Erro ao processar com IA:', error)
      setAiError(error instanceof Error ? error.message : 'Erro desconhecido ao processar comando')
    } finally {
      setIsProcessingAI(false)
    }
  }, [voiceCommand])

  useEffect(() => {
    if (isCommandListening && commandTranscript) {
      setTranscriptionText(`Capturando comando: ${commandTranscript}`)
    } else if (isWakeWordListening) {
      setTranscriptionText('Helena está ouvindo por "Helena"...')
    } else if (wakeWordError || commandError) {
      setTranscriptionText(`Erro: ${wakeWordError || commandError}`)
    } else if (voiceCommand) {
      setTranscriptionText(`Último comando: ${voiceCommand}`)
    }
  }, [isCommandListening, commandTranscript, isWakeWordListening, wakeWordError, commandError, voiceCommand])

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-helena-blue bg-opacity-10 rounded-full mb-4">
              <Mic className={`text-helena-blue text-2xl ${(isWakeWordListening || isCommandListening) ? 'pulse-animation' : ''}`} size={32} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {isCommandListening ? '🎤 Capturando comando...' : 
               isWakeWordListening ? '🎤 Helena está ouvindo...' : 
               '🎤 Assistente Helena'}
            </h2>
            <p className="text-helena-gray">
              {isAssistantActive ? 'Diga "Helena" seguido do seu comando' : 'Clique em "Ativar Assistente" para começar'}
            </p>
          </div>

          <div className="bg-helena-light rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-helena-blue rounded-full mt-2 pulse-animation"></div>
              <div className="flex-1">
                <p className="text-sm text-helena-gray mb-2">Transcrição em tempo real:</p>
                <div className="text-gray-800 min-h-[60px] text-lg leading-relaxed">
                  {transcriptionText}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <div className="flex items-start space-x-3">
              <Lightbulb className="text-helena-blue mt-1" size={16} />
              <div>
                <p className="text-sm font-medium text-helena-blue mb-1">Exemplo de comando:</p>
                <p className="text-sm text-gray-700">&quot;Helena, prescreva para João da Silva: Dipirona 500mg, 1 comprimido de 8 em 8 horas por 3 dias&quot;</p>
              </div>
            </div>
          </div>

          {(prescricaoData || aiError) && (
            <div className={`rounded-xl p-6 mb-8 ${aiError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-start space-x-3">
                {aiError ? (
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-600 text-sm">✕</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                )}
                <div className="flex-1">
                  {aiError ? (
                    <>
                      <p className="text-sm font-medium text-red-800 mb-1">Erro no processamento da IA:</p>
                      <p className="text-sm text-red-700">{aiError}</p>
                    </>
                  ) : prescricaoData ? (
                    <>
                      <p className="text-sm font-medium text-green-800 mb-3">Prescrição estruturada pela IA:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-xs font-medium text-green-700 mb-1">Paciente:</p>
                          <p className="text-sm text-gray-800">{prescricaoData.paciente}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-xs font-medium text-green-700 mb-1">Medicamento:</p>
                          <p className="text-sm text-gray-800">{prescricaoData.medicamento}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200 md:col-span-2">
                          <p className="text-xs font-medium text-green-700 mb-1">Posologia:</p>
                          <p className="text-sm text-gray-800">{prescricaoData.posologia}</p>
                        </div>
                        {prescricaoData.observacoes && (
                          <div className="bg-white rounded-lg p-3 border border-green-200 md:col-span-2">
                            <p className="text-xs font-medium text-green-700 mb-1">Observações:</p>
                            <p className="text-sm text-gray-800">{prescricaoData.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            {!isAssistantActive ? (
              <button 
                onClick={handleActivateAssistant}
                disabled={!isWakeWordSupported || !isCommandSupported}
                className="flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mic size={16} />
                <span>Ativar Assistente</span>
              </button>
            ) : (
              <button 
                onClick={handleDeactivateAssistant}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Mic size={16} />
                <span>Desativar Assistente</span>
              </button>
            )}
            
            {voiceCommand && (
              <button 
                onClick={handleProcessWithAI}
                disabled={isProcessingAI}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm disabled:cursor-not-allowed"
              >
                {isProcessingAI ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Brain size={16} />
                )}
                <span>{isProcessingAI ? 'Processando...' : 'Preencher com IA'}</span>
              </button>
            )}
            
            <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
              <FileText size={16} />
              <span>Salvar em PDF</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
              <PenTool size={16} />
              <span>Assinar Digitalmente</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">24</p>
                <p className="text-sm text-helena-gray">Prescrições hoje</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-helena-blue" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">12</p>
                <p className="text-sm text-helena-gray">Pacientes atendidos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">2.5min</p>
                <p className="text-sm text-helena-gray">Tempo médio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
