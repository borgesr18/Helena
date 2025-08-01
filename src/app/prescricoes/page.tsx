'use client'

import React, { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Plus, Search, FileText, Download, Eye, Calendar } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

type Prescricao = {
  id: string
  paciente_id: string
  data: string
  medicamentos: any[]
  observacoes: string | null
  pdf_url: string | null
  pacientes: {
    nome: string
  }
}

export default function PrescricoesPage() {
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([])
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
      const { data, error } = await supabase
        .from('prescricoes')
        .select(`
          *,
          pacientes (nome)
        `)
        .order('data', { ascending: false })

      if (error) throw error
      setPrescricoes(data || [])
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrescricoes = prescricoes.filter(prescricao =>
    prescricao.pacientes.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-helena-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-helena-gray">Carregando prescrições...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Prescrições</h1>
            <p className="text-helena-gray mt-2">Gerencie suas prescrições médicas</p>
          </div>
          <Link
            href="/prescricoes/nova"
            className="flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Nova Prescrição</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-helena-gray" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome do paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {filteredPrescricoes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-helena-light rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-helena-gray" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {searchTerm ? 'Nenhuma prescrição encontrada' : 'Nenhuma prescrição criada'}
              </h3>
              <p className="text-helena-gray mb-4">
                {searchTerm 
                  ? 'Tente buscar com outros termos'
                  : 'Comece criando sua primeira prescrição'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/prescricoes/nova"
                  className="inline-flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus size={16} />
                  <span>Criar Prescrição</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Paciente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Medicamentos</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescricoes.map((prescricao) => (
                    <tr key={prescricao.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {prescricao.pacientes.nome}
                      </td>
                      <td className="py-3 px-4 text-helena-gray">
                        {formatDate(prescricao.data)}
                      </td>
                      <td className="py-3 px-4 text-helena-gray">
                        {prescricao.medicamentos?.length || 0} medicamento(s)
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          prescricao.pdf_url 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prescricao.pdf_url ? 'PDF Gerado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-helena-gray hover:text-helena-blue hover:bg-helena-light rounded-lg transition-colors">
                            <Eye size={16} />
                          </button>
                          {prescricao.pdf_url && (
                            <button className="p-2 text-helena-gray hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <Download size={16} />
                            </button>
                          )}
                        </div>
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
