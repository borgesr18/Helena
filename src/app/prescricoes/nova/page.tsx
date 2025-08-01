'use client'

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArrowLeft, Save, Plus, Trash2, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Patient = {
  id: string
  nome: string
}

type Medicamento = {
  nome: string
  dosagem: string
  via: string
  frequencia: string
  duracao: string
}

export default function NovaPrescricaoPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([
    { nome: '', dosagem: '', via: '', frequencia: '', duracao: '' }
  ])
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
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
        .select('id, nome')
        .order('nome')

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const addMedicamento = () => {
    setMedicamentos([...medicamentos, { nome: '', dosagem: '', via: '', frequencia: '', duracao: '' }])
  }

  const removeMedicamento = (index: number) => {
    if (medicamentos.length > 1) {
      setMedicamentos(medicamentos.filter((_, i) => i !== index))
    }
  }

  const updateMedicamento = (index: number, field: keyof Medicamento, value: string) => {
    const updated = medicamentos.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    )
    setMedicamentos(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedPatientId) return

    setLoading(true)
    setError('')

    try {
      const validMedicamentos = medicamentos.filter(med => med.nome.trim())
      
      if (validMedicamentos.length === 0) {
        setError('Adicione pelo menos um medicamento')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('prescricoes')
        .insert({
          user_id: user.id,
          paciente_id: selectedPatientId,
          medicamentos: validMedicamentos,
          observacoes: observacoes || null,
        })

      if (error) throw error

      router.push('/prescricoes')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro ao criar prescrição')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/prescricoes"
            className="p-2 text-helena-gray hover:text-helena-blue hover:bg-helena-light rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Nova Prescrição</h1>
            <p className="text-helena-gray mt-2">Crie uma nova prescrição médica</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-helena-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <User className="text-helena-blue" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Selecionar Paciente</h2>
                <p className="text-helena-gray text-sm">Escolha o paciente para esta prescrição</p>
              </div>
            </div>

            <div>
              <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-2">
                Paciente *
              </label>
              <select
                id="patient"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nome}
                  </option>
                ))}
              </select>
              {patients.length === 0 && (
                <p className="text-sm text-helena-gray mt-2">
                  Nenhum paciente encontrado.{' '}
                  <Link href="/pacientes/novo" className="text-helena-blue hover:underline">
                    Cadastre um paciente primeiro
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-helena-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                  <FileText className="text-helena-blue" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Medicamentos</h2>
                  <p className="text-helena-gray text-sm">Adicione os medicamentos prescritos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addMedicamento}
                className="flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={16} />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="space-y-6">
              {medicamentos.map((medicamento, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-800">Medicamento {index + 1}</h3>
                    {medicamentos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicamento(index)}
                        className="p-2 text-helena-gray hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Medicamento *
                      </label>
                      <input
                        type="text"
                        value={medicamento.nome}
                        onChange={(e) => updateMedicamento(index, 'nome', e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
                        placeholder="Ex: Dipirona"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dosagem *
                      </label>
                      <input
                        type="text"
                        value={medicamento.dosagem}
                        onChange={(e) => updateMedicamento(index, 'dosagem', e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
                        placeholder="Ex: 500mg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Via de Administração *
                      </label>
                      <select
                        value={medicamento.via}
                        onChange={(e) => updateMedicamento(index, 'via', e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
                      >
                        <option value="">Selecione a via</option>
                        <option value="Oral">Oral</option>
                        <option value="Sublingual">Sublingual</option>
                        <option value="Intramuscular">Intramuscular</option>
                        <option value="Intravenosa">Intravenosa</option>
                        <option value="Tópica">Tópica</option>
                        <option value="Inalatória">Inalatória</option>
                        <option value="Retal">Retal</option>
                        <option value="Oftálmica">Oftálmica</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequência *
                      </label>
                      <input
                        type="text"
                        value={medicamento.frequencia}
                        onChange={(e) => updateMedicamento(index, 'frequencia', e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
                        placeholder="Ex: 1 comprimido de 8 em 8 horas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duração *
                      </label>
                      <input
                        type="text"
                        value={medicamento.duracao}
                        onChange={(e) => updateMedicamento(index, 'duracao', e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
                        placeholder="Ex: 7 dias"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Observações</h2>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
              placeholder="Observações adicionais sobre a prescrição..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
            <Link
              href="/prescricoes"
              className="px-6 py-3 text-helena-gray hover:text-gray-800 font-medium transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedPatientId}
              className="flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Save size={16} />
              <span>{loading ? 'Salvando...' : 'Salvar Prescrição'}</span>
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}