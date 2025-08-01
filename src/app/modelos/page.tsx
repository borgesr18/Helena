'use client'

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileCheck, Plus, Edit, Trash2, Search, Tag } from 'lucide-react';
import { PrescriptionTemplate, CreateTemplateData } from '@/lib/templatesService';

export default function ModelosPage() {
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/modelos')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        template.medicamento.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || template.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(templates.map(t => t.categoria).filter(Boolean)))

  const handleCreateTemplate = async (templateData: CreateTemplateData) => {
    try {
      const response = await fetch('/api/modelos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      })

      if (response.ok) {
        await fetchTemplates()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating template:', error)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-helena-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-helena-gray">Carregando modelos...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Modelos de Prescrição</h1>
            <p className="text-helena-gray mt-2">Gerencie seus modelos de prescrição reutilizáveis</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Novo Modelo</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-helena-gray" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou medicamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent transition-colors"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-helena-light rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="text-helena-gray" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {searchTerm || selectedCategory ? 'Nenhum modelo encontrado' : 'Nenhum modelo criado'}
              </h3>
              <p className="text-helena-gray mb-4">
                {searchTerm || selectedCategory 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie seu primeiro modelo de prescrição para agilizar o atendimento'
                }
              </p>
              {!searchTerm && !selectedCategory && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus size={16} />
                  <span>Criar Modelo</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{template.nome}</h3>
                      {template.categoria && (
                        <div className="flex items-center space-x-1 mb-2">
                          <Tag size={14} className="text-helena-gray" />
                          <span className="text-sm text-helena-gray">{template.categoria}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-helena-gray hover:text-helena-blue rounded">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-helena-gray hover:text-red-600 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Medicamento:</span>
                      <p className="text-gray-600">{template.medicamento}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Posologia:</span>
                      <p className="text-gray-600">{template.posologia}</p>
                    </div>
                    {template.observacoes && (
                      <div>
                        <span className="font-medium text-gray-700">Observações:</span>
                        <p className="text-gray-600">{template.observacoes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-helena-gray">
                      Usado {template.uso_count} vezes
                    </span>
                    <button className="text-sm bg-helena-blue text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
                      Aplicar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCreateModal && (
          <CreateTemplateModal
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateTemplate}
          />
        )}
      </div>
    </MainLayout>
  )
}

function CreateTemplateModal({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void
  onSave: (data: CreateTemplateData) => void 
}) {
  const [formData, setFormData] = useState<CreateTemplateData>({
    nome: '',
    categoria: '',
    especialidade: '',
    medicamento: '',
    posologia: '',
    observacoes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Novo Modelo de Prescrição</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Modelo *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData((prev: CreateTemplateData) => ({...prev, nome: e.target.value}))}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                placeholder="Ex: Dor de Garganta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData((prev: CreateTemplateData) => ({...prev, categoria: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                placeholder="Ex: Infecções"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medicamento *</label>
            <input
              type="text"
              value={formData.medicamento}
              onChange={(e) => setFormData((prev: CreateTemplateData) => ({...prev, medicamento: e.target.value}))}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
              placeholder="Ex: Amoxicilina 500mg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Posologia *</label>
            <input
              type="text"
              value={formData.posologia}
              onChange={(e) => setFormData((prev: CreateTemplateData) => ({...prev, posologia: e.target.value}))}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
              placeholder="Ex: 1 comprimido de 8 em 8 horas por 7 dias"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData((prev: CreateTemplateData) => ({...prev, observacoes: e.target.value}))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-helena-gray hover:text-gray-800 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-helena-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Criar Modelo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
