'use client'

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Search, Eye, Calendar, User, Pill } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PrescricaoWithId } from '@/lib/prescriptionService';

export default function HistoricoPage() {
  const [prescricoes, setPrescricoes] = useState<PrescricaoWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchPrescricoes()
    }
  }, [user])

  const fetchPrescricoes = async () => {
    try {
      const response = await fetch('/api/prescricoes')
      if (!response.ok) throw new Error('Erro ao buscar prescrições')
      
      const data = await response.json()
      setPrescricoes(data)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrescricoes = prescricoes.filter(prescricao =>
    prescricao.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescricao.medicamento.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Histórico de Prescrições</h1>
            <p className="text-helena-gray mt-2">Visualize e gerencie suas prescrições anteriores</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-helena-gray" size={20} />
              <input
                type="text"
                placeholder="Buscar por paciente ou medicamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helena-blue mx-auto"></div>
              <p className="text-helena-gray mt-4">Carregando prescrições...</p>
            </div>
          ) : filteredPrescricoes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-helena-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="text-helena-gray" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {searchTerm ? 'Nenhuma prescrição encontrada' : 'Nenhuma prescrição ainda'}
              </h3>
              <p className="text-helena-gray">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Suas prescrições aparecerão aqui após serem criadas'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-helena-light">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Paciente</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Medicamento</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Data</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPrescricoes.map((prescricao) => (
                    <tr key={prescricao.id} className="hover:bg-helena-light transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-helena-blue bg-opacity-10 rounded-full flex items-center justify-center">
                            <User className="text-helena-blue" size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{prescricao.paciente}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-800">{prescricao.medicamento}</p>
                        <p className="text-sm text-helena-gray">{prescricao.posologia}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-helena-gray">
                          <Calendar size={16} />
                          <span className="text-sm">{formatDate(prescricao.criado_em)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/historico/${prescricao.id}`}
                          className="flex items-center space-x-2 text-helena-blue hover:text-blue-600 font-medium transition-colors"
                        >
                          <Eye size={16} />
                          <span>Visualizar</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
