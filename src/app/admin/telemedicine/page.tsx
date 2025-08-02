'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VideoConsultation } from '@/components/telemedicine/VideoConsultation';
import { 
  Video, 
  Calendar, 
  User, 
  Phone,
  Truck,
  Bell,
  Plus
} from 'lucide-react';

interface Consulta {
  id: string;
  paciente: {
    id: string;
    nome: string;
    cpf?: string;
  };
  tipo: string;
  status: string;
  data_agendamento: Date;
  duracao_minutos: number;
  link_video?: string;
  observacoes?: string;
  created_at: Date;
}

export default function TelemedicinePage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoCall, setActiveVideoCall] = useState<{
    roomId: string;
    peerId: string;
  } | null>(null);

  useEffect(() => {
    fetchConsultas();
  }, []);

  const fetchConsultas = async () => {
    try {
      const response = await fetch('/api/telemedicine/consultas');
      if (response.ok) {
        const data = await response.json();
        setConsultas(data.map((c: Consulta) => ({
          ...c,
          data_agendamento: new Date(c.data_agendamento),
          created_at: new Date(c.created_at)
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarVideoConsulta = async (consultaId: string) => {
    try {
      const response = await fetch(`/api/telemedicine/video/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultaId })
      });

      if (response.ok) {
        const { roomId, peerId } = await response.json();
        setActiveVideoCall({ roomId, peerId });
      }
    } catch (error) {
      console.error('Erro ao iniciar vídeo consulta:', error);
    }
  };

  const encerrarVideoConsulta = () => {
    setActiveVideoCall(null);
    fetchConsultas(); // Atualizar lista
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'text-blue-600 bg-blue-100';
      case 'em_andamento': return 'text-green-600 bg-green-100';
      case 'concluida': return 'text-gray-600 bg-gray-100';
      case 'cancelada': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <Video className="text-blue-600" size={16} />;
      case 'telefone': return <Phone className="text-green-600" size={16} />;
      default: return <User className="text-gray-600" size={16} />;
    }
  };

  if (activeVideoCall) {
    return (
      <VideoConsultation
        roomId={activeVideoCall.roomId}
        peerId={activeVideoCall.peerId}
        onEndCall={encerrarVideoConsulta}
      />
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Telemedicina</h1>
            <p className="text-helena-gray">Gerencie consultas remotas e entregas de medicamentos</p>
          </div>
          <button
            className="flex items-center space-x-2 bg-helena-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            <span>Nova Consulta</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-helena-gray">Consultas Hoje</p>
                <p className="text-2xl font-bold text-gray-800">
                  {consultas.filter(c => 
                    new Date(c.data_agendamento).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-helena-gray">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-800">
                  {consultas.filter(c => c.status === 'em_andamento').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Video className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-helena-gray">Entregas Ativas</p>
                <p className="text-2xl font-bold text-gray-800">3</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-helena-gray">Notificações</p>
                <p className="text-2xl font-bold text-gray-800">7</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Consultas List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Consultas Agendadas</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helena-blue mx-auto"></div>
                <p className="text-helena-gray mt-2">Carregando consultas...</p>
              </div>
            ) : consultas.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-helena-gray mt-2">Nenhuma consulta agendada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultas.map((consulta) => (
                  <div key={consulta.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getTipoIcon(consulta.tipo)}
                          <span className="font-medium text-gray-800">{consulta.paciente.nome}</span>
                        </div>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consulta.status)}`}>
                          {consulta.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">
                            {consulta.data_agendamento.toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-helena-gray">
                            {consulta.data_agendamento.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} • {consulta.duracao_minutos}min
                          </p>
                        </div>
                        
                        {consulta.tipo === 'video' && consulta.status === 'agendada' && (
                          <button
                            onClick={() => iniciarVideoConsulta(consulta.id)}
                            className="flex items-center space-x-2 bg-helena-blue text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Video size={16} />
                            <span>Iniciar</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {consulta.observacoes && (
                      <p className="text-sm text-helena-gray mt-2">{consulta.observacoes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
