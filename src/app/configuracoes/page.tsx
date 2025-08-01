'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Settings, User, Shield, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ConfiguracoesPage() {
  const { profile } = useAuth()

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>
          <p className="text-helena-gray mt-2">Gerencie suas preferências e configurações</p>
        </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={profile?.nome || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CRM
                </label>
                <input
                  type="text"
                  value={profile?.crm || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidade
                </label>
                <input
                  type="text"
                  value={profile?.especialidade || 'Não informado'}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <input
                  type="text"
                  value={profile?.tipo || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-helena-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <Shield className="text-helena-blue" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Segurança</h2>
                <p className="text-helena-gray text-sm">Configurações de segurança da conta</p>
              </div>
            </div>

            <div className="text-center py-8">
              <p className="text-helena-gray">
                Configurações de segurança estarão disponíveis em breve
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-helena-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <Bell className="text-helena-blue" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Notificações</h2>
                <p className="text-helena-gray text-sm">Gerencie suas preferências de notificação</p>
              </div>
            </div>

            <div className="text-center py-8">
              <p className="text-helena-gray">
                Configurações de notificação estarão disponíveis em breve
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
