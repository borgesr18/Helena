'use client'

import React from 'react'

interface PrescriptionLayoutProps {
  paciente: string
  medicamento: string
  posologia: string
  observacoes: string
  data: string
}

export function PrescriptionLayout({
  paciente,
  medicamento,
  posologia,
  observacoes,
  data
}: PrescriptionLayoutProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Print Button - Hidden when printing */}
      <div className="print:hidden mb-6 flex justify-end">
        <button
          onClick={handlePrint}
          className="bg-helena-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Imprimir Receita</span>
        </button>
      </div>

      {/* Prescription Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm print:shadow-none print:border-none">
        {/* Header */}
        <div className="text-center mb-8 border-b border-gray-200 pb-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-helena-blue rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Helena</h1>
              <p className="text-sm text-helena-gray">Assistente Médica de Prescrição</p>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">RECEITUÁRIO MÉDICO</h2>
        </div>

        {/* Patient Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">
            Dados do Paciente
          </h3>
          <div className="bg-helena-light rounded-lg p-4">
            <p className="text-lg font-medium text-gray-800">
              <span className="text-helena-gray">Paciente:</span> {paciente}
            </p>
          </div>
        </div>

        {/* Prescription Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">
            Prescrição Médica
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <p className="text-base text-gray-800 mb-2">
                <span className="font-semibold text-helena-gray">Medicamento:</span>
              </p>
              <p className="text-lg font-medium text-gray-900">{medicamento}</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <p className="text-base text-gray-800 mb-2">
                <span className="font-semibold text-helena-gray">Posologia:</span>
              </p>
              <p className="text-lg text-gray-900">{posologia}</p>
            </div>

            {observacoes && (
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <p className="text-base text-gray-800 mb-2">
                  <span className="font-semibold text-helena-gray">Observações:</span>
                </p>
                <p className="text-lg text-gray-900">{observacoes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="mb-12">
          <p className="text-right text-gray-600">
            <span className="font-medium">Data:</span> {data}
          </p>
        </div>

        {/* Signature Area */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex justify-between items-end">
            <div className="text-center">
              <div className="w-64 border-b border-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600 font-medium">Assinatura do Médico</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-xs text-gray-500 text-center">
                  Espaço para<br />
                  Carimbo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Receituário gerado pelo sistema Helena - Assistente Médica de Prescrição
          </p>
        </div>
      </div>
    </div>
  )
}
