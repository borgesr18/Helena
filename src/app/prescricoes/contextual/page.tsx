'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Brain, AlertTriangle, CheckCircle } from 'lucide-react';

interface DrugInteraction {
  medicamento1: string;
  medicamento2: string;
  severidade: 'leve' | 'moderada' | 'grave';
  descricao: string;
  fonte: string;
}

interface ContextualPrescription {
  prescricao: {
    paciente: string;
    medicamento: string;
    posologia: string;
    observacoes: string;
  };
  interactions: DrugInteraction[];
  warnings: DrugInteraction[];
  currentMedications: string[];
}

export default function PrescricaoContextualPage() {
  const [transcricao, setTranscricao] = useState('');
  const [pacienteNome, setPacienteNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContextualPrescription | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcricao.trim() || !pacienteNome.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/ai/prescricao-contextual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcricao, pacienteNome })
      });

      if (!response.ok) {
        throw new Error('Erro ao processar prescrição contextual');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Erro ao processar prescrição contextual');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severidade: string) => {
    switch (severidade) {
      case 'grave': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderada': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
            <Brain className="text-helena-blue" size={32} />
            <span>Prescrição com IA Contextual</span>
          </h1>
          <p className="text-helena-gray mt-2">
            Gere prescrições inteligentes com análise de histórico e detecção de interações medicamentosas
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Paciente
              </label>
              <input
                type="text"
                value={pacienteNome}
                onChange={(e) => setPacienteNome(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                placeholder="Digite o nome do paciente"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comando de Voz / Transcrição
              </label>
              <textarea
                value={transcricao}
                onChange={(e) => setTranscricao(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                placeholder="Ex: Prescreva para João Silva: Amoxicilina 500mg, 1 comprimido de 8 em 8 horas por 7 dias"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-helena-blue text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processando com IA...</span>
                </>
              ) : (
                <>
                  <Brain size={20} />
                  <span>Gerar Prescrição Contextual</span>
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-red-600" size={20} />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {result.warnings.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="text-red-600" size={24} />
                  <h3 className="text-lg font-semibold text-red-800">Alertas Críticos</h3>
                </div>
                <div className="space-y-3">
                  {result.warnings.map((warning, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-red-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-red-800">
                          {warning.medicamento1} ↔ {warning.medicamento2}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(warning.severidade)}`}>
                          {warning.severidade}
                        </span>
                      </div>
                      <p className="text-red-700 text-sm">{warning.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="text-green-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Prescrição Gerada</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paciente</label>
                  <p className="text-gray-800 font-medium">{result.prescricao.paciente}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medicamento</label>
                  <p className="text-gray-800 font-medium">{result.prescricao.medicamento}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posologia</label>
                  <p className="text-gray-800">{result.prescricao.posologia}</p>
                </div>
                
                {result.prescricao.observacoes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                    <p className="text-gray-800">{result.prescricao.observacoes}</p>
                  </div>
                )}
              </div>
            </div>

            {result.currentMedications.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Medicamentos Atuais do Paciente</h3>
                <div className="flex flex-wrap gap-2">
                  {result.currentMedications.map((med, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.interactions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">Interações Detectadas</h3>
                <div className="space-y-3">
                  {result.interactions.map((interaction, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-yellow-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-yellow-800">
                          {interaction.medicamento1} ↔ {interaction.medicamento2}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(interaction.severidade)}`}>
                          {interaction.severidade}
                        </span>
                      </div>
                      <p className="text-yellow-700 text-sm">{interaction.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
