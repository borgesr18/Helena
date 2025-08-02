'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Shield, FileText, Users, AlertTriangle, Download } from 'lucide-react';

interface ComplianceMetrics {
  totalPrescricoes: number;
  prescricoesAssinadas: number;
  certificadosAtivos: number;
  validacoesCFM: number;
  eventosAuditoria: number;
}

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalPrescricoes: 0,
    prescricoesAssinadas: 0,
    certificadosAtivos: 0,
    validacoesCFM: 0,
    eventosAuditoria: 0
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setMetrics({
        totalPrescricoes: 1247,
        prescricoesAssinadas: 1189,
        certificadosAtivos: 23,
        validacoesCFM: 18,
        eventosAuditoria: 5432
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const complianceRate = metrics.totalPrescricoes > 0 
    ? (metrics.prescricoesAssinadas / metrics.totalPrescricoes * 100).toFixed(1)
    : '0';

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard de Compliance</h1>
            <p className="text-helena-gray mt-2">Monitoramento de conformidade regulatória</p>
          </div>
          <button className="flex items-center space-x-2 bg-helena-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            <Download size={20} />
            <span>Relatório Compliance</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-helena-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <FileText className="text-helena-blue" size={24} />
              </div>
              <div>
                <p className="text-sm text-helena-gray">Taxa de Compliance</p>
                <p className="text-2xl font-bold text-gray-800">{complianceRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <Shield className="text-green-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-helena-gray">Certificados Ativos</p>
                <p className="text-2xl font-bold text-gray-800">{metrics.certificadosAtivos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <Users className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-helena-gray">Validações CFM</p>
                <p className="text-2xl font-bold text-gray-800">{metrics.validacoesCFM}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-purple-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-helena-gray">Eventos Auditoria</p>
                <p className="text-2xl font-bold text-gray-800">{metrics.eventosAuditoria}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status de Conformidade</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">ICP-Brasil</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Conforme</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">Validação CFM</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Conforme</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">ANVISA</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Conforme</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">Auditoria</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Ativo</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Regulamentações</h2>
            
            <div className="space-y-3 text-sm text-helena-gray">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-helena-blue rounded-full mt-2"></div>
                <p>MP 2.200-2/2001 - Infraestrutura de Chaves Públicas Brasileira</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-helena-blue rounded-full mt-2"></div>
                <p>Lei 14.063/2020 - Assinaturas eletrônicas</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-helena-blue rounded-full mt-2"></div>
                <p>Portaria SVS/MS #344/1998 - Regulamento Técnico</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-helena-blue rounded-full mt-2"></div>
                <p>CFM Resolução 2.314/2022 - Telemedicina</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
