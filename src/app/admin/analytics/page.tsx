'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  AlertTriangle,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface DashboardMetrics {
  totalPrescriptions: number;
  totalPatients: number;
  averageConsultationTime: number;
  prescriptionsToday: number;
  patientsToday: number;
  growthRate: number;
  topMedications: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  prescriptionsByMonth: Array<{
    month: string;
    count: number;
  }>;
  patientDemographics: {
    ageGroups: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    genderDistribution: Array<{
      gender: string;
      count: number;
      percentage: number;
    }>;
  };
  complianceMetrics: {
    digitalSignatures: number;
    cfmValidations: number;
    sbisSubmissions: number;
    auditScore: number;
  };
}

interface PredictiveInsight {
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const metricsResponse = await fetch('/api/analytics/dashboard');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      const insightsResponse = await fetch('/api/analytics/insights');
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const exportReport = async (type: string) => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, dateRange })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `helena-${type}-report.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const COLORS = ['#4D9DE0', '#15B79E', '#F59E0B', '#EF4444', '#8B5CF6'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics & BI</h1>
            <p className="text-helena-gray mt-2">
              Dashboard avançado com insights preditivos e relatórios detalhados
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-helena-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
              <span>Atualizar</span>
            </button>
            
            <button
              onClick={() => exportReport('dashboard')}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download size={16} />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-helena-gray">Total Prescrições</p>
                  <p className="text-2xl font-bold text-gray-800">{metrics.totalPrescriptions}</p>
                  <p className="text-xs text-green-600 mt-1">
                    +{metrics.prescriptionsToday} hoje
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-helena-blue" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-helena-gray">Total Pacientes</p>
                  <p className="text-2xl font-bold text-gray-800">{metrics.totalPatients}</p>
                  <p className="text-xs text-green-600 mt-1">
                    +{metrics.patientsToday} hoje
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-helena-gray">Tempo Médio</p>
                  <p className="text-2xl font-bold text-gray-800">{metrics.averageConsultationTime}min</p>
                  <p className="text-xs text-helena-gray mt-1">por consulta</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-helena-gray">Crescimento</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {metrics.growthRate > 0 ? '+' : ''}{metrics.growthRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-helena-gray mt-1">últimos 30 dias</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Prescriptions Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Tendência de Prescrições
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics.prescriptionsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#4D9DE0" 
                    fill="#4D9DE0" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top Medications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Medicamentos Mais Prescritos
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.topMedications.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4D9DE0" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Age Demographics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Demografia por Idade
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.patientDemographics.ageGroups}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {metrics.patientDemographics.ageGroups.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Compliance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Métricas de Compliance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-helena-gray">Assinaturas Digitais</span>
                  <span className="font-semibold">{metrics.complianceMetrics.digitalSignatures}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-helena-gray">Validações CFM</span>
                  <span className="font-semibold">{metrics.complianceMetrics.cfmValidations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-helena-gray">Submissões SBIS</span>
                  <span className="font-semibold">{metrics.complianceMetrics.sbisSubmissions}</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-helena-gray">Score de Auditoria</span>
                    <span className="font-semibold">{metrics.complianceMetrics.auditScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-helena-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.complianceMetrics.auditScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predictive Insights */}
        {insights.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <AlertTriangle className="text-helena-blue" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">
                Insights Preditivos
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <div 
                  key={index}
                  className={`border-l-4 p-4 rounded-lg ${getPriorityColor(insight.priority)}`}
                >
                  <h4 className="font-semibold text-gray-800 mb-2">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  <p className="text-xs text-gray-500 font-medium">
                    Ação recomendada: {insight.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Relatórios Rápidos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => exportReport('prescriptions')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="text-helena-blue" size={20} />
              <div className="text-left">
                <p className="font-medium text-gray-800">Prescrições</p>
                <p className="text-xs text-helena-gray">Relatório detalhado</p>
              </div>
            </button>
            
            <button
              onClick={() => exportReport('patients')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="text-green-600" size={20} />
              <div className="text-left">
                <p className="font-medium text-gray-800">Pacientes</p>
                <p className="text-xs text-helena-gray">Demografia e histórico</p>
              </div>
            </button>
            
            <button
              onClick={() => exportReport('medications')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="text-yellow-600" size={20} />
              <div className="text-left">
                <p className="font-medium text-gray-800">Medicamentos</p>
                <p className="text-xs text-helena-gray">Análise de prescrições</p>
              </div>
            </button>
            
            <button
              onClick={() => exportReport('compliance')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="text-purple-600" size={20} />
              <div className="text-left">
                <p className="font-medium text-gray-800">Compliance</p>
                <p className="text-xs text-helena-gray">Auditoria e certificações</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
