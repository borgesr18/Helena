'use client'

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArrowLeft, Calendar, User, Pill, FileText, Printer } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PrescricaoWithId } from '@/lib/prescriptionService';

export default function PrescricaoDetailPage() {
  const [prescricao, setPrescricao] = useState<PrescricaoWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const params = useParams()

  useEffect(() => {
    if (params.id) {
      fetchPrescricao(params.id as string)
    }
  }, [params.id])

  const fetchPrescricao = async (id: string) => {
    try {
      const response = await fetch(`/api/prescricoes/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Prescrição não encontrada')
        } else {
          throw new Error('Erro ao buscar prescrição')
        }
        return
      }
      
      const data = await response.json()
      setPrescricao(data)
    } catch (error) {
      console.error('Error fetching prescription:', error)
      setError('Erro ao carregar prescrição')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helena-blue mx-auto"></div>
            <p className="text-helena-gray mt-4">Carregando prescrição...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !prescricao) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">{error || 'Prescrição não encontrada'}</h3>
            <Link
              href="/historico"
              className="text-helena-blue hover:text-blue-600 font-medium"
            >
              Voltar ao histórico
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/historico"
            className="p-2 text-helena-gray hover:text-helena-blue hover:bg-helena-light rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">Prescrição Médica</h1>
            <p className="text-helena-gray mt-2">Visualização detalhada da prescrição</p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-helena-light rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <User className="text-helena-blue" size={20} />
                <h3 className="font-medium text-gray-800">Paciente</h3>
              </div>
              <p className="text-lg font-semibold text-gray-900">{prescricao.paciente}</p>
            </div>

            <div className="bg-helena-light rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="text-helena-blue" size={20} />
                <h3 className="font-medium text-gray-800">Data da Prescrição</h3>
              </div>
              <p className="text-lg font-semibold text-gray-900">{formatDate(prescricao.criado_em)}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-helena-light rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Pill className="text-helena-blue" size={24} />
                <h3 className="text-xl font-semibold text-gray-800">Medicamento</h3>
              </div>
              <p className="text-lg text-gray-900 mb-4">{prescricao.medicamento}</p>
              
              <h4 className="font-medium text-gray-800 mb-2">Posologia:</h4>
              <p className="text-gray-700">{prescricao.posologia}</p>
            </div>

            {prescricao.observacoes && (
              <div className="bg-helena-light rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="text-helena-blue" size={24} />
                  <h3 className="text-xl font-semibold text-gray-800">Observações</h3>
                </div>
                <p className="text-gray-700">{prescricao.observacoes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
