import React from 'react'

export default function PrescriptionLayout({
  paciente = 'Nome do Paciente',
  medicamento = 'Nome do Medicamento',
  posologia = '1 comprimido de 8/8h por 5 dias',
  observacoes = '',
  data = new Date().toLocaleDateString(),
}) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white text-black font-serif">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Receituário Médico</h1>
        <p className="text-sm text-center text-gray-500">Sistema Helena - Prescrição por Voz</p>
      </div>

      <div className="mb-6">
        <p><strong>Paciente:</strong> {paciente}</p>
        <p><strong>Data:</strong> {data}</p>
      </div>

      <div className="mb-6">
        <p className="mb-2"><strong>Prescrição:</strong></p>
        <div className="border border-gray-400 rounded p-4">
          <p><strong>Medicamento:</strong> {medicamento}</p>
          <p><strong>Posologia:</strong> {posologia}</p>
          {observacoes && <p><strong>Observações:</strong> {observacoes}</p>}
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <div className="w-1/2">
          <div className="border-t border-black w-full"></div>
          <p className="text-sm mt-2">Assinatura e Carimbo do Médico</p>
        </div>
      </div>

      <div className="mt-8 print:hidden text-center">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Imprimir Receita
        </button>
      </div>
    </div>
  )
}
