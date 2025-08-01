'use client'

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileCheck, Plus } from 'lucide-react';

export default function ModelosPage() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Modelos</h1>
            <p className="text-helena-gray mt-2">Gerencie modelos de prescrição</p>
          </div>
          <button className="flex items-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
            <Plus size={16} />
            <span>Novo Modelo</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-helena-light rounded-full flex items-center justify-center mx-auto mb-4">
              <FileCheck className="text-helena-gray" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Funcionalidade em desenvolvimento
            </h3>
            <p className="text-helena-gray">
              Os modelos de prescrição estarão disponíveis em breve
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}