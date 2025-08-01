'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Building, Settings, Plus, AlertCircle } from 'lucide-react';

interface Clinica {
  id: string;
  nome: string;
  plano: string;
  usuarios_count: number;
  pacientes_count: number;
  ativo: boolean;
  max_usuarios: number;
  max_pacientes: number;
}

export default function ClinicasAdminPage() {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClinica, setNewClinica] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    plano: 'gratuito'
  });

  useEffect(() => {
    fetchClinicas();
  }, []);

  const fetchClinicas = async () => {
    try {
      const response = await fetch('/api/admin/clinicas');
      if (response.ok) {
        const data = await response.json();
        setClinicas(data);
      }
    } catch (error) {
      console.error('Error fetching clinicas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClinica = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/clinicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClinica)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewClinica({
          nome: '',
          cnpj: '',
          endereco: '',
          telefone: '',
          email: '',
          plano: 'gratuito'
        });
        fetchClinicas();
      }
    } catch (error) {
      console.error('Error creating clinica:', error);
    }
  };

  const getPlanoColor = (plano: string) => {
    switch (plano) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'basico': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helena-blue"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestão de Clínicas</h1>
            <p className="text-helena-gray mt-2">Gerencie clínicas e usuários do sistema</p>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-helena-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            <span>Nova Clínica</span>
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Criar Nova Clínica</h2>
            <form onSubmit={handleCreateClinica} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Clínica</label>
                <input
                  type="text"
                  value={newClinica.nome}
                  onChange={(e) => setNewClinica({...newClinica, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                <input
                  type="text"
                  value={newClinica.cnpj}
                  onChange={(e) => setNewClinica({...newClinica, cnpj: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <input
                  type="text"
                  value={newClinica.endereco}
                  onChange={(e) => setNewClinica({...newClinica, endereco: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  type="text"
                  value={newClinica.telefone}
                  onChange={(e) => setNewClinica({...newClinica, telefone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newClinica.email}
                  onChange={(e) => setNewClinica({...newClinica, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plano</label>
                <select
                  value={newClinica.plano}
                  onChange={(e) => setNewClinica({...newClinica, plano: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                >
                  <option value="gratuito">Gratuito</option>
                  <option value="basico">Básico</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-helena-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Criar Clínica
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinicas.map((clinica) => (
            <div key={clinica.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-helena-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Building className="text-helena-blue" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 truncate">{clinica.nome}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPlanoColor(clinica.plano)}`}>
                    {clinica.plano}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-helena-gray">Usuários</span>
                  <div className="flex items-center space-x-1">
                    <span className={`font-medium ${getUsageStatus(clinica.usuarios_count, clinica.max_usuarios)}`}>
                      {clinica.usuarios_count}/{clinica.max_usuarios}
                    </span>
                    {clinica.usuarios_count >= clinica.max_usuarios * 0.9 && (
                      <AlertCircle size={16} className="text-yellow-500" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-helena-gray">Pacientes</span>
                  <div className="flex items-center space-x-1">
                    <span className={`font-medium ${getUsageStatus(clinica.pacientes_count, clinica.max_pacientes)}`}>
                      {clinica.pacientes_count}/{clinica.max_pacientes}
                    </span>
                    {clinica.pacientes_count >= clinica.max_pacientes * 0.9 && (
                      <AlertCircle size={16} className="text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full flex items-center justify-center space-x-2 text-helena-blue hover:bg-helena-light py-2 rounded-lg transition-colors">
                  <Settings size={16} />
                  <span>Gerenciar</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {clinicas.length === 0 && (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma clínica encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">Comece criando uma nova clínica.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
