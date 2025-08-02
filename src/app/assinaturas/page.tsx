'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PenTool, Shield, CheckCircle, AlertTriangle, Upload } from 'lucide-react';

interface Certificate {
  serialNumber: string;
  issuer: string;
  type: string;
  validTo: Date;
  thumbprint: string;
}

interface CFMValidation {
  crm: string;
  uf: string;
  nome: string;
  situacao: string;
  dataValidacao: Date;
}

export default function AssinaturasPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [cfmValidation, setCfmValidation] = useState<CFMValidation | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [validatingCRM, setValidatingCRM] = useState(false);
  const [crmForm, setCrmForm] = useState({ crm: '', uf: '' });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/compliance/certificates');
      if (response.ok) {
        const data = await response.json();
        setCertificates(data);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCert(true);
    try {
      const certificateData = await file.text();
      
      const response = await fetch('/api/compliance/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateData })
      });

      if (response.ok) {
        await fetchCertificates();
        alert('Certificado cadastrado com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading certificate:', error);
      alert('Erro ao processar certificado');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleCFMValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidatingCRM(true);
    
    try {
      const response = await fetch('/api/compliance/cfm-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crmForm)
      });

      if (response.ok) {
        const validation = await response.json();
        setCfmValidation(validation);
        alert('CRM validado com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Error validating CRM:', error);
      alert('Erro ao validar CRM');
    } finally {
      setValidatingCRM(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Assinaturas Digitais</h1>
            <p className="text-helena-gray mt-2">Gerencie certificados ICP-Brasil e validação CFM</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-helena-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <Shield className="text-helena-blue" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Certificados ICP-Brasil</h2>
                <p className="text-sm text-helena-gray">Gerencie seus certificados digitais</p>
              </div>
            </div>

            <div className="space-y-4">
              {certificates.length > 0 ? (
                certificates.map((cert, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">Certificado {cert.type}</span>
                      <CheckCircle className="text-green-500" size={16} />
                    </div>
                    <div className="text-sm text-helena-gray space-y-1">
                      <p>Série: {cert.serialNumber}</p>
                      <p>Emissor: {cert.issuer}</p>
                      <p>Válido até: {new Date(cert.validTo).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <PenTool className="mx-auto text-helena-gray mb-4" size={32} />
                  <p className="text-helena-gray">Nenhum certificado cadastrado</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <label className="block">
                  <input
                    type="file"
                    accept=".p12,.pfx,.pem,.crt"
                    onChange={handleCertificateUpload}
                    disabled={uploadingCert}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center space-x-2 bg-helena-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                    <Upload size={16} />
                    <span>{uploadingCert ? 'Processando...' : 'Adicionar Certificado'}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-500" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Validação CFM</h2>
                <p className="text-sm text-helena-gray">Valide seu registro no CFM</p>
              </div>
            </div>

            {cfmValidation ? (
              <div className="border border-green-200 bg-green-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="font-medium text-green-800">CRM Validado</span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Nome: {cfmValidation.nome}</p>
                  <p>CRM: {cfmValidation.crm}/{cfmValidation.uf}</p>
                  <p>Situação: {cfmValidation.situacao}</p>
                  <p>Validado em: {new Date(cfmValidation.dataValidacao).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCFMValidation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do CRM
                  </label>
                  <input
                    type="text"
                    value={crmForm.crm}
                    onChange={(e) => setCrmForm({ ...crmForm, crm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                    placeholder="Ex: 123456"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado (UF)
                  </label>
                  <select
                    value={crmForm.uf}
                    onChange={(e) => setCrmForm({ ...crmForm, uf: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-helena-blue focus:border-transparent"
                    required
                  >
                    <option value="">Selecione o estado</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="PR">Paraná</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="BA">Bahia</option>
                    <option value="GO">Goiás</option>
                    <option value="PE">Pernambuco</option>
                    <option value="CE">Ceará</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={validatingCRM}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  <span>{validatingCRM ? 'Validando...' : 'Validar CRM'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-blue-600 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Conformidade Regulatória</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Certificados ICP-Brasil garantem validade jurídica conforme MP 2.200-2/2001</p>
                <p>• Validação CFM obrigatória para prescrições médicas digitais</p>
                <p>• Conformidade com ANVISA (Portarias SVS/MS #344/1998 e #6/1999)</p>
                <p>• Auditoria completa de todas as ações para compliance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
