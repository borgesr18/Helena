'use client'

import React, { useState } from 'react'
import PrescriptionLayout from '@/components/prescricao/PrescriptionLayout'

export default function Home() {
  // Simulação de dados (em breve virão da IA por voz)
  const [paciente, setPaciente] = useState('Rodrigo Borges de Amorim')
  const [medicamento, setMedicamento] = useState('Dipirona 500mg')
  const [posologia, setPosologia] = useState('1 comprimido de 8 em 8 horas por 5 dias')
  const [observacoes, setObservacoes] = useState('Tomar após as refeições')
  const [data] = useState(new Date().toLocaleDateString())

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <PrescriptionLayout
        paciente={paciente}
        medicamento={medicamento}
        posologia={posologia}
        observacoes={observacoes}
        data={data}
      />
    </div>
  )
}

