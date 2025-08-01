'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { History } from 'lucide-react'

export default function HistoricoPage() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Histórico</h1>
            <p className="text-helena-gray mt-2">Visualize o histórico de atividades</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-helena-light rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="text-helena-gray" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Funcionalidade em desenvolvimento
            </h3>
            <p className="text-helena-gray">
              O histórico de atividades estará disponível em breve
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
