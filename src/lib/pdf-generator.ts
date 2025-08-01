import jsPDF from 'jspdf'

export type Medicamento = {
  nome: string
  dosagem: string
  via: string
  frequencia: string
  duracao: string
}

export type PrescricaoData = {
  paciente: {
    nome: string
    cpf?: string
    data_nascimento?: string
  }
  medico: {
    nome: string
    crm: string
    especialidade?: string
  }
  medicamentos: Medicamento[]
  observacoes?: string
  data: string
}

export function generatePrescriptionPDF(data: PrescricaoData): jsPDF {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.width
  const margin = 20
  let yPosition = 30

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('PRESCRIÇÃO MÉDICA', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 20

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  doc.text(`Data: ${new Date(data.data).toLocaleDateString('pt-BR')}`, pageWidth - margin, yPosition, { align: 'right' })
  
  yPosition += 20

  doc.setFont('helvetica', 'bold')
  doc.text('DADOS DO MÉDICO:', margin, yPosition)
  yPosition += 8
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${data.medico.nome}`, margin, yPosition)
  yPosition += 6
  doc.text(`CRM: ${data.medico.crm}`, margin, yPosition)
  yPosition += 6
  if (data.medico.especialidade) {
    doc.text(`Especialidade: ${data.medico.especialidade}`, margin, yPosition)
    yPosition += 6
  }
  
  yPosition += 10

  doc.setFont('helvetica', 'bold')
  doc.text('DADOS DO PACIENTE:', margin, yPosition)
  yPosition += 8
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${data.paciente.nome}`, margin, yPosition)
  yPosition += 6
  if (data.paciente.cpf) {
    doc.text(`CPF: ${data.paciente.cpf}`, margin, yPosition)
    yPosition += 6
  }
  if (data.paciente.data_nascimento) {
    doc.text(`Data de Nascimento: ${new Date(data.paciente.data_nascimento).toLocaleDateString('pt-BR')}`, margin, yPosition)
    yPosition += 6
  }
  
  yPosition += 15

  doc.setFont('helvetica', 'bold')
  doc.text('MEDICAMENTOS PRESCRITOS:', margin, yPosition)
  yPosition += 10
  
  data.medicamentos.forEach((medicamento, index) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${medicamento.nome}`, margin, yPosition)
    yPosition += 6
    
    doc.setFont('helvetica', 'normal')
    doc.text(`   Dosagem: ${medicamento.dosagem}`, margin, yPosition)
    yPosition += 5
    doc.text(`   Via: ${medicamento.via}`, margin, yPosition)
    yPosition += 5
    doc.text(`   Frequência: ${medicamento.frequencia}`, margin, yPosition)
    yPosition += 5
    doc.text(`   Duração: ${medicamento.duracao}`, margin, yPosition)
    yPosition += 10
  })
  
  if (data.observacoes) {
    yPosition += 5
    doc.setFont('helvetica', 'bold')
    doc.text('OBSERVAÇÕES:', margin, yPosition)
    yPosition += 8
    
    doc.setFont('helvetica', 'normal')
    const observacoesLines = doc.splitTextToSize(data.observacoes, pageWidth - 2 * margin)
    doc.text(observacoesLines, margin, yPosition)
    yPosition += observacoesLines.length * 6
  }
  
  yPosition += 30
  
  doc.setFont('helvetica', 'normal')
  doc.text('_'.repeat(40), pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 6
  doc.text(`${data.medico.nome}`, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 6
  doc.text(`CRM: ${data.medico.crm}`, pageWidth / 2, yPosition, { align: 'center' })
  
  return doc
}

export async function uploadPDFToSupabase(pdfBlob: Blob, fileName: string) {
  const { supabase } = await import('./supabase')
  
  const { error } = await supabase.storage
    .from('prescricoes')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('prescricoes')
    .getPublicUrl(fileName)

  return publicUrl
}
