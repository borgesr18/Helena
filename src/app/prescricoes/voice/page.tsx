'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Mic, MicOff, Volume2, Send, Save } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

export default function VoicePrescriptionPage() {
  const [prescriptionData, setPrescriptionData] = useState({
    paciente: '',
    medicamento: '',
    posologia: '',
    observacoes: ''
  });
  const [saving, setSaving] = useState(false);

  const {
    isListening,
    isSupported,
    transcript,
    confidence,
    error,
    lastCommand,
    wakeWordDetected,
    toggleListening
  } = useVoiceRecognition({ autoStart: false });

  useEffect(() => {
    if (lastCommand && lastCommand.action === 'prescribe') {
      const params = lastCommand.parameters || {};
      setPrescriptionData(prev => ({
        ...prev,
        paciente: params.patient || prev.paciente,
        medicamento: params.medication || prev.medicamento,
        posologia: params.frequency && params.duration 
          ? `${params.frequency} por ${params.duration}`
          : prev.posologia
      }));
    }
  }, [lastCommand]);

  const handleProcessTranscript = async () => {
    if (!transcript.trim()) return;

    try {
      const response = await fetch('/api/openai/prescricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcricao: transcript })
      });

      if (response.ok) {
        const data = await response.json();
        setPrescriptionData(data);
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/prescricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData)
      });

      if (response.ok) {
        alert('Prescrição salva com sucesso!');
        setPrescriptionData({
          paciente: '',
          medicamento: '',
          posologia: '',
          observacoes: ''
        });
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Erro ao salvar prescrição');
    } finally {
      setSaving(false);
    }
  };

  if (!isSupported) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Reconhecimento de Voz Não Suportado
          </h1>
          <p className="text-helena-gray">
            Seu navegador não suporta reconhecimento de voz. 
            Use Chrome, Edge ou Safari para acessar esta funcionalidade.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Prescrição por Voz</h1>
            <p className="text-helena-gray mt-2">
              Use comandos de voz para criar prescrições rapidamente
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              wakeWordDetected ? 'bg-green-500 animate-pulse' : 
              isListening ? 'bg-helena-blue animate-pulse' : 'bg-gray-200'
            }`}>
              {isListening ? (
                <Mic className="text-white" size={32} />
              ) : (
                <MicOff className="text-gray-500" size={32} />
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {wakeWordDetected ? '🎤 Helena ativada!' :
               isListening ? '🎤 Ouvindo...' : 'Clique para falar'}
            </h2>
            
            <p className="text-helena-gray mb-6">
              Diga &quot;Helena&quot; para ativar ou clique no botão abaixo
            </p>
            
            <button
              onClick={toggleListening}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-helena-blue hover:bg-blue-600 text-white'
              }`}
            >
              {isListening ? 'Parar' : 'Iniciar'} Reconhecimento
            </button>
          </div>

          <div className="bg-helena-light rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <Volume2 className="text-helena-blue mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-helena-gray mb-2">Transcrição em tempo real:</p>
                <div className="text-gray-800 min-h-[60px] text-lg leading-relaxed">
                  {transcript || 'Aguardando comando de voz...'}
                </div>
                {confidence > 0 && (
                  <p className="text-xs text-helena-gray mt-2">
                    Confiança: {Math.round(confidence * 100)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleProcessTranscript}
              disabled={!transcript.trim()}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              <span>Processar Comando</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Prescrição Gerada</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente
              </label>
              <input
                type="text"
                value={prescriptionData.paciente}
                onChange={(e) => setPrescriptionData(prev => ({ ...prev, paciente: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                placeholder="Nome do paciente"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicamento
              </label>
              <input
                type="text"
                value={prescriptionData.medicamento}
                onChange={(e) => setPrescriptionData(prev => ({ ...prev, medicamento: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                placeholder="Nome e dosagem do medicamento"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posologia
              </label>
              <input
                type="text"
                value={prescriptionData.posologia}
                onChange={(e) => setPrescriptionData(prev => ({ ...prev, posologia: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                placeholder="Como tomar o medicamento"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={prescriptionData.observacoes}
                onChange={(e) => setPrescriptionData(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                placeholder="Observações adicionais"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={saving || !prescriptionData.paciente || !prescriptionData.medicamento}
              className="flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span>{saving ? 'Salvando...' : 'Salvar Prescrição'}</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
