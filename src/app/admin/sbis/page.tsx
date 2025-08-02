'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Send, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface SBISSubmission {
  id: string;
  prescricao_id: string;
  sbis_id: string | null;
  status: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado';
  submitted_at: Date;
  error_message: string | null;
}

export default function SBISPage() {
  const [submissions, setSubmissions] = useState<SBISSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setSubmissions([
        {
          id: '1',
          prescricao_id: 'presc-1',
          sbis_id: 'SBIS-2024-001',
          status: 'aprovado',
          submitted_at: new Date('2024-01-15'),
          error_message: null
        },
        {
          id: '2',
          prescricao_id: 'presc-2',
          sbis_id: null,
          status: 'pendente',
          submitted_at: new Date('2024-01-16'),
          error_message: null
        }
      ]);
    } catch (error) {
      console.error('Error loading SBIS submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToSBIS = async (prescricaoId: string) => {
    setSubmitting(prescricaoId);
    try {
      const response = await fetch('/api/sbis/submit-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: prescricaoId,
          patientCpf: '12345678901',
          patientName: 'João Silva',
          medications: [
            {
              nome: 'Amoxicilina',
              dosagem: '500mg',
              quantidade: '21',
              via: 'oral',
              frequencia: '8/8h',
              duracao: '7 dias'
            }
          ]
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Prescrição submetida ao SBIS: ${result.prescriptionId || 'Sucesso'}`);
        loadSubmissions();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting to SBIS:', error);
      alert('Erro ao submeter para SBIS');
    } finally {
      setSubmitting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejeitado':
        return <XCircle className="text-red-500" size={20} />;
      case 'enviado':
        return <Send className="text-blue-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'text-green-600 bg-green-50';
      case 'rejeitado':
        return 'text-red-600 bg-red-50';
      case 'enviado':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helena-blue"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">SBIS/RNDS Integration</h1>
            <p className="text-helena-gray mt-2">
              Sistema Brasileiro de Informação em Saúde - Receitas Digitais Oficiais
            </p>
          </div>
          <button
            onClick={() => handleSubmitToSBIS('new-prescription')}
            disabled={submitting === 'new-prescription'}
            className="flex items-center space-x-2 bg-helena-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
            <span>{submitting === 'new-prescription' ? 'Enviando...' : 'Testar Submissão'}</span>
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <FileText className="text-blue-600 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Status da Integração</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Ambiente: Sandbox (desenvolvimento)</p>
                <p>• Padrão FHIR R4 implementado</p>
                <p>• Certificação ANVISA: Pendente</p>
                <p>• Para produção: configurar SBIS_API_KEY</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Submissões SBIS</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Prescrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SBIS ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Submissão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {submission.prescricao_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.sbis_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.submitted_at.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.status === 'pendente' && (
                        <button
                          onClick={() => handleSubmitToSBIS(submission.prescricao_id)}
                          disabled={submitting === submission.prescricao_id}
                          className="text-helena-blue hover:text-blue-600 font-medium"
                        >
                          {submitting === submission.prescricao_id ? 'Enviando...' : 'Reenviar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
