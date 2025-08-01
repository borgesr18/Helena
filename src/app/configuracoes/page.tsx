'use client'

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { User, Bell, Palette, Brain, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserSettings } from '@/lib/settingsService';

export default function ConfiguracoesPage() {
  const { profile } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/configuracoes')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setMessage('Configurações salvas com sucesso!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        throw new Error('Erro ao salvar configurações')
      }
    } catch {
      setMessage('Erro ao salvar configurações')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-helena-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-helena-gray">Carregando configurações...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>
          <p className="text-helena-gray mt-2">Gerencie suas preferências e configurações</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('sucesso') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-helena-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <User className="text-helena-blue" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Perfil do Médico</h2>
                <p className="text-helena-gray text-sm">Informações básicas do seu perfil</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={profile?.nome || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CRM</label>
                <input
                  type="text"
                  value={profile?.crm || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-helena-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <Palette className="text-helena-blue" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Aparência</h2>
                <p className="text-helena-gray text-sm">Personalize a aparência do sistema</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'claro', label: 'Claro' },
                  { value: 'escuro', label: 'Escuro' },
                  { value: 'auto', label: 'Automático' }
                ].map((tema) => (
                  <button
                    key={tema.value}
                    onClick={() => setSettings(prev => prev ? {...prev, tema: tema.value as 'claro' | 'escuro' | 'auto'} : null)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      settings?.tema === tema.value
                        ? 'border-helena-blue bg-helena-blue bg-opacity-10 text-helena-blue'
                        : 'border-gray-200 hover:border-helena-blue'
                    }`}
                  >
                    {tema.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-helena-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <Brain className="text-helena-blue" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Inteligência Artificial</h2>
                <p className="text-helena-gray text-sm">Configure o modelo de IA para processamento</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Modelo de IA</label>
              <select
                value={settings?.modelo_ia || 'gpt-3.5-turbo'}
                onChange={(e) => setSettings(prev => prev ? {...prev, modelo_ia: e.target.value as 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3'} : null)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Rápido)</option>
                <option value="gpt-4">GPT-4 (Mais Preciso)</option>
                <option value="claude-3">Claude 3 (Alternativo)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-helena-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <Bell className="text-helena-blue" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Notificações</h2>
                <p className="text-helena-gray text-sm">Configure suas preferências de notificação</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Notificações por Email</h3>
                  <p className="text-sm text-helena-gray">Receba atualizações importantes por email</p>
                </div>
                <button
                  onClick={() => setSettings(prev => prev ? {...prev, notificacoes_email: !prev.notificacoes_email} : null)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings?.notificacoes_email ? 'bg-helena-blue' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.notificacoes_email ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Backup Automático</h3>
                  <p className="text-sm text-helena-gray">Backup automático dos seus dados</p>
                </div>
                <button
                  onClick={() => setSettings(prev => prev ? {...prev, backup_automatico: !prev.backup_automatico} : null)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings?.backup_automatico ? 'bg-helena-blue' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.backup_automatico ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Save size={16} />
              <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
