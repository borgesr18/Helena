'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Search, 
  User, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Pill, 
  Activity,
  Clock,
  Download
} from 'lucide-react';

interface PatientTimeline {
  id: string;
  type: 'prescription' | 'consultation' | 'exam' | 'allergy' | 'medication_change';
  date: Date;
  title: string;
  description: string;
  data: Record<string, unknown>;
  createdBy: string;
}

interface MedicalHistory {
  patientId: string;
  patientName: string;
  timeline: PatientTimeline[];
  allergies: string[];
  currentMedications: string[];
  chronicConditions: string[];
  lastConsultation: Date | null;
  totalPrescriptions: number;
}

interface EMRSummary {
  totalPatients: number;
  activePatients: number;
  recentConsultations: number;
  pendingFollowUps: number;
  criticalAlerts: Array<{
    patientId: string;
    patientName: string;
    alert: string;
    severity: 'low' | 'medium' | 'high';
    date: Date;
  }>;
}

export default function EMRPage() {
  const [summary, setSummary] = useState<EMRSummary | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<MedicalHistory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    patientId: string;
    patientName: string;
    matchType: 'name' | 'medication' | 'condition';
    matchText: string;
    lastConsultation: Date | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadEMRSummary();
  }, []);

  const loadEMRSummary = async () => {
    try {
      const response = await fetch('/api/emr/summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error loading EMR summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(`/api/emr/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadPatientHistory = async (patientId: string) => {
    try {
      const response = await fetch(`/api/emr/patient/${patientId}`);
      if (response.ok) {
        const history = await response.json();
        setSelectedPatient(history);
      }
    } catch (error) {
      console.error('Error loading patient history:', error);
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'prescription': return <Pill className="text-blue-600" size={16} />;
      case 'consultation': return <User className="text-green-600" size={16} />;
      case 'exam': return <FileText className="text-purple-600" size={16} />;
      case 'allergy': return <AlertTriangle className="text-red-600" size={16} />;
      case 'medication_change': return <Activity className="text-orange-600" size={16} />;
      default: return <Clock className="text-gray-600" size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-500 bg-green-50 text-green-800';
      default: return 'border-gray-500 bg-gray-50 text-gray-800';
    }
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Prontuário Eletrônico</h1>
            <p className="text-helena-gray mt-2">
              Gestão completa do histórico médico dos pacientes
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-helena-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              <Download size={16} />
              <span>Exportar Dados</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-helena-gray">Total Pacientes</p>
                  <p className="text-2xl font-bold text-gray-800">{summary.totalPatients}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="text-helena-blue" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-helena-gray">Pacientes Ativos</p>
                  <p className="text-2xl font-bold text-gray-800">{summary.activePatients}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-helena-gray">Consultas Recentes</p>
                  <p className="text-2xl font-bold text-gray-800">{summary.recentConsultations}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-helena-gray">Follow-ups Pendentes</p>
                  <p className="text-2xl font-bold text-gray-800">{summary.pendingFollowUps}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search and Alerts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Buscar Paciente
              </h3>
              
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nome, medicamento ou condição..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="bg-helena-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {searchLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search size={16} />
                  )}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.patientId}
                      onClick={() => loadPatientHistory(result.patientId)}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <p className="font-medium text-gray-800">{result.patientName}</p>
                      <p className="text-xs text-helena-gray">
                        {result.matchType}: {result.matchText}
                      </p>
                      {result.lastConsultation && (
                        <p className="text-xs text-helena-gray">
                          Última consulta: {new Date(result.lastConsultation).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Critical Alerts */}
            {summary && summary.criticalAlerts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Alertas Críticos
                </h3>
                
                <div className="space-y-3">
                  {summary.criticalAlerts.slice(0, 5).map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 border-l-4 rounded-lg ${getSeverityColor(alert.severity)}`}
                    >
                      <p className="font-medium">{alert.patientName}</p>
                      <p className="text-sm">{alert.alert}</p>
                      <p className="text-xs opacity-75">
                        {new Date(alert.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Patient History */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {selectedPatient.patientName}
                    </h3>
                    <p className="text-helena-gray">
                      {selectedPatient.totalPrescriptions} prescrições • 
                      Última consulta: {selectedPatient.lastConsultation 
                        ? new Date(selectedPatient.lastConsultation).toLocaleDateString('pt-BR')
                        : 'Nunca'
                      }
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="text-helena-gray hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>

                {/* Patient Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {selectedPatient.allergies.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-red-800 mb-1">Alergias</p>
                      <p className="text-sm text-red-700">
                        {selectedPatient.allergies.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  {selectedPatient.currentMedications.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-800 mb-1">Medicamentos Atuais</p>
                      <p className="text-sm text-blue-700">
                        {selectedPatient.currentMedications.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800 mb-1">Status</p>
                    <p className="text-sm text-green-700">
                      {selectedPatient.totalPrescriptions > 0 ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Histórico Médico</h4>
                  
                  <div className="space-y-3">
                    {selectedPatient.timeline.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {getTimelineIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-800">{event.title}</p>
                            <p className="text-sm text-helena-gray">
                              {new Date(event.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <FileText className="mx-auto text-helena-gray mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Selecione um Paciente
                </h3>
                <p className="text-helena-gray">
                  Use a busca ao lado para encontrar e visualizar o histórico médico de um paciente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
