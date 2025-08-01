import { PrescriptionLayout } from '@/components/prescricao/PrescriptionLayout'

export default function PrescricaoPage() {
  const paciente = 'Rodrigo Borges de Amorim'
  const medicamento = 'Dipirona 500mg'
  const posologia = '1 comprimido de 8 em 8 horas por 5 dias'
  const observacoes = 'Tomar após as refeições'
  const data = new Date().toLocaleDateString('pt-BR')

  return (
    <div className="min-h-screen bg-helena-light py-8">
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
