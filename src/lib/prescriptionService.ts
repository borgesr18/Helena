import { PrismaClient } from '@prisma/client'
import { PrescricaoData } from '@/types/prescription'

const prisma = new PrismaClient()

export interface PrescricaoWithId {
  id: string
  paciente: string
  medicamento: string
  posologia: string
  observacoes: string
  criado_em: Date
}

export async function savePrescription(
  userId: string, 
  prescricaoData: PrescricaoData
): Promise<PrescricaoWithId> {
  try {
    const prescricao = await prisma.prescricao.create({
      data: {
        user_id: userId,
        paciente: prescricaoData.paciente,
        medicamento: prescricaoData.medicamento,
        posologia: prescricaoData.posologia,
        observacoes: prescricaoData.observacoes || '',
      }
    })

    return {
      id: prescricao.id,
      paciente: prescricao.paciente,
      medicamento: prescricao.medicamento,
      posologia: prescricao.posologia,
      observacoes: prescricao.observacoes,
      criado_em: prescricao.criado_em,
    }
  } catch (error) {
    console.error('Error saving prescription:', error)
    throw new Error('Falha ao salvar prescrição')
  }
}

export async function getUserPrescriptions(userId: string): Promise<PrescricaoWithId[]> {
  try {
    const prescricoes = await prisma.prescricao.findMany({
      where: { user_id: userId },
      orderBy: { criado_em: 'desc' }
    })

    return prescricoes.map((p) => ({
      id: p.id,
      paciente: p.paciente,
      medicamento: p.medicamento,
      posologia: p.posologia,
      observacoes: p.observacoes,
      criado_em: p.criado_em,
    }))
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    throw new Error('Falha ao buscar prescrições')
  }
}

export async function getPrescriptionById(
  userId: string, 
  prescricaoId: string
): Promise<PrescricaoWithId | null> {
  try {
    const prescricao = await prisma.prescricao.findFirst({
      where: { 
        id: prescricaoId,
        user_id: userId 
      }
    })

    if (!prescricao) return null

    return {
      id: prescricao.id,
      paciente: prescricao.paciente,
      medicamento: prescricao.medicamento,
      posologia: prescricao.posologia,
      observacoes: prescricao.observacoes,
      criado_em: prescricao.criado_em,
    }
  } catch (error) {
    console.error('Error fetching prescription:', error)
    throw new Error('Falha ao buscar prescrição')
  }
}
