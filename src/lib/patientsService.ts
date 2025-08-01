import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'helena-default-key-32-chars-long'

export interface Patient {
  id: string
  user_id: string
  nome: string
  cpf?: string
  data_nascimento?: Date
  genero?: string
  created_at: Date
  updated_at: Date
}

export interface CreatePatientData {
  nome: string
  cpf?: string
  data_nascimento?: string
  genero?: string
}

function encrypt(text: string): string {
  if (!text) return text
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    return encryptedText
  }
}

export async function getUserPatients(userId: string): Promise<Patient[]> {
  try {
    const patients = await prisma.paciente.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    })

    return patients.map((patient: {
      id: string;
      user_id: string;
      nome: string;
      cpf: string | null;
      data_nascimento: Date | null;
      genero: string | null;
      created_at: Date;
      updated_at: Date;
    }) => ({
      ...patient,
      cpf: patient.cpf ? decrypt(patient.cpf) : undefined
    })) as Patient[]
  } catch (error) {
    console.error('Error fetching patients:', error)
    throw new Error('Falha ao buscar pacientes')
  }
}

export async function createPatient(
  userId: string, 
  patientData: CreatePatientData
): Promise<Patient> {
  try {
    const patient = await prisma.paciente.create({
      data: {
        user_id: userId,
        nome: patientData.nome,
        cpf: patientData.cpf ? encrypt(patientData.cpf) : null,
        data_nascimento: patientData.data_nascimento ? new Date(patientData.data_nascimento) : null,
        genero: patientData.genero || null
      }
    })

    return {
      ...patient,
      cpf: patient.cpf ? decrypt(patient.cpf) : undefined
    } as Patient
  } catch (error) {
    console.error('Error creating patient:', error)
    throw new Error('Falha ao criar paciente')
  }
}

export async function updatePatient(
  userId: string,
  patientId: string,
  updates: Partial<CreatePatientData>
): Promise<Patient> {
  try {
    const updateData: Record<string, string | Date | null> = { ...updates }
    if (updateData.cpf && typeof updateData.cpf === 'string') {
      updateData.cpf = encrypt(updateData.cpf)
    }
    if (updateData.data_nascimento) {
      updateData.data_nascimento = new Date(updateData.data_nascimento)
    }

    const patient = await prisma.paciente.update({
      where: { 
        id: patientId,
        user_id: userId
      },
      data: updateData
    })

    return {
      ...patient,
      cpf: patient.cpf ? decrypt(patient.cpf) : undefined
    } as Patient
  } catch (error) {
    console.error('Error updating patient:', error)
    throw new Error('Falha ao atualizar paciente')
  }
}

export async function deletePatient(userId: string, patientId: string): Promise<void> {
  try {
    await prisma.paciente.delete({
      where: { 
        id: patientId,
        user_id: userId
      }
    })
  } catch (error) {
    console.error('Error deleting patient:', error)
    throw new Error('Falha ao excluir paciente')
  }
}

export async function getPatientById(
  userId: string, 
  patientId: string
): Promise<Patient | null> {
  try {
    const patient = await prisma.paciente.findFirst({
      where: { 
        id: patientId,
        user_id: userId 
      }
    })

    if (!patient) return null

    return {
      ...patient,
      cpf: patient.cpf ? decrypt(patient.cpf) : undefined
    } as Patient
  } catch (error) {
    console.error('Error fetching patient:', error)
    throw new Error('Falha ao buscar paciente')
  }
}
