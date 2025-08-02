import jsPDF from 'jspdf';
import { icpBrasilService, DigitalSignature } from './icpBrasilService';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export interface DigitalSignatureData {
  certificateId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
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

export async function generateSignedPrescriptionPDF(
  data: PrescricaoData,
  signatureData: DigitalSignatureData
): Promise<{ pdf: jsPDF; signature: DigitalSignature }> {
  const doc = generatePrescriptionPDF(data);
  
  const pdfBuffer = doc.output('arraybuffer');
  const documentHash = crypto.createHash('sha256').update(Buffer.from(pdfBuffer)).digest('hex');
  
  const signature = await icpBrasilService.signDocument(
    documentHash,
    signatureData.certificateId,
    signatureData.userId
  );
  
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = pageHeight - 80;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ASSINATURA DIGITAL ICP-BRASIL', 20, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Certificado: ${signature.certificate.serialNumber}`, 20, yPosition);
  yPosition += 4;
  doc.text(`Emissor: ${signature.certificate.issuer}`, 20, yPosition);
  yPosition += 4;
  doc.text(`Assinado em: ${signature.timestamp.toLocaleString('pt-BR')}`, 20, yPosition);
  yPosition += 4;
  doc.text(`Hash: ${signature.hash.substring(0, 32)}...`, 20, yPosition);
  yPosition += 6;
  
  doc.setFontSize(8);
  doc.text('Este documento foi assinado digitalmente conforme MP 2.200-2/2001 e Lei 14.063/2020', 20, yPosition);
  yPosition += 3;
  doc.text('Validade jurídica garantida por certificado ICP-Brasil', 20, yPosition);
  
  return { pdf: doc, signature };
}

export async function storeDigitalSignature(
  prescricaoId: string,
  signature: DigitalSignature,
  signatureData: DigitalSignatureData
): Promise<string> {
  const stored = await prisma.assinaturaDigital.create({
    data: {
      prescricao_id: prescricaoId,
      certificado_id: signatureData.certificateId,
      user_id: signatureData.userId,
      hash_documento: signature.hash,
      assinatura_digital: signature.signature,
      timestamp_assinatura: signature.timestamp,
      ip_origem: signatureData.ipAddress,
      user_agent: signatureData.userAgent,
      status: 'valida'
    }
  });
  
  return stored.id;
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

export async function generateAndStorePrescriptionPDF(
  prescricaoData: {
    paciente: string;
    medicamento: string;
    posologia: string;
    observacoes?: string;
  },
  prescricaoId: string
): Promise<string> {
  try {
    const pdfData: PrescricaoData = {
      paciente: {
        nome: prescricaoData.paciente
      },
      medico: {
        nome: 'Dr. Usuário',
        crm: '00000-XX'
      },
      medicamentos: [{
        nome: prescricaoData.medicamento,
        dosagem: prescricaoData.posologia,
        via: 'Oral',
        frequencia: prescricaoData.posologia,
        duracao: '7 dias'
      }],
      observacoes: prescricaoData.observacoes,
      data: new Date().toISOString()
    }

    const doc = generatePrescriptionPDF(pdfData)
    const pdfBlob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' })
    
    const fileName = `prescricao-${prescricaoId}-${Date.now()}.pdf`
    const publicUrl = await uploadPDFToSupabase(pdfBlob, fileName)
    
    return publicUrl
  } catch (error) {
    console.error('Error generating and storing PDF:', error)
    throw new Error('Falha ao gerar PDF')
  }
}
