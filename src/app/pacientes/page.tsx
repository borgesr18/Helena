'use client'

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Patient = {
  id: string
  nome: string
  cpf: string | null
  data_nascimento: string | null
  genero: string | null
  created_at: string
}

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchPatients()
    }
  }, [user])

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.cpf && patient.cpf.includes(searchTerm))
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-helena-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-helena-gray">Carregando pacientes...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Pacientes</h1>
            <p className="text-helena-gray mt-2">Gerencie seus pacientes cadastrados</p>
          </div>
          <Link
            href="/pacientes/novo"
            className="flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Novo Paciente</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-helena-gray" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-helena-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-helena-gray" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
              </h3>
              <p className="text-helena-gray mb-4">
                {searchTerm 
                  ? 'Tente buscar com outros termos'
                  : 'Comece cadastrando seu primeiro paciente'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/pacientes/novo"
                  className="inline-flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus size={16} />
                  <span>Cadastrar Paciente</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">CPF</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Data Nascimento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Gênero</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cadastrado em</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{patient.nome}</td>
                      <td className="py-3 px-4 text-helena-gray">{patient.cpf || '-'}</td>
                      <td className="py-3 px-4 text-helena-gray">
                        {patient.data_nascimento ? formatDate(patient.data_nascimento) : '-'}
                      </td>
                      <td className="py-3 px-4 text-helena-gray">{patient.genero || '-'}</td>
                      <td className="py-3 px-4 text-helena-gray">{formatDate(patient.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-helena-gray hover:text-helena-blue hover:bg-helena-light rounded-lg transition-colors">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 text-helena-gray hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
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