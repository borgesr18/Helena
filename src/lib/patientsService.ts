import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'helena-default-key-32-chars-long'

export interface Patient {
  id: string
  user_id: string
  nome: string
  cpf?: string
  data_nascimento?: string | null
  genero?: string | null
  created_at: string
  updated_at: string
}

export interface CreatePatientData {
  nome: string
  cpf?: string | null
  data_nascimento?: string | null
  genero?: string | null
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

export async function getUserPatients(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Patient[]> {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((patient) => ({
      ...patient,
      cpf: patient.cpf ? decrypt(patient.cpf) : undefined,
    })) as Patient[]
  } catch (error) {
    console.error('Error fetching patients:', error)
    throw new Error('Falha ao buscar pacientes')
  }
}

export async function createPatient(
  supabase: SupabaseClient<Database>,
  userId: string,
  patientData: CreatePatientData
): Promise<Patient> {
  try {
    const payload = {
      user_id: userId,
      nome: patientData.nome,
      cpf: patientData.cpf ? encrypt(patientData.cpf) : null,
      data_nascimento: patientData.data_nascimento ?? null,
      genero: patientData.genero ?? null,
    }

    const { data, error } = await supabase
      .from('pacientes')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error

    return {
      ...data,
      cpf: data.cpf ? decrypt(data.cpf) : undefined,
    } as Patient
  } catch (error) {
    console.error('Error creating patient:', error)
    throw new Error('Falha ao criar paciente')
  }
}

export async function updatePatient(
  supabase: SupabaseClient<Database>,
  userId: string,
  patientId: string,
  updates: Partial<CreatePatientData>
): Promise<Patient> {
  try {
    const updateData: Record<string, string | null> = {}
    if (typeof updates.nome === 'string') updateData.nome = updates.nome
    if (typeof updates.cpf === 'string') updateData.cpf = encrypt(updates.cpf)
    if (updates.data_nascimento !== undefined) updateData.data_nascimento = updates.data_nascimento
    if (updates.genero !== undefined) updateData.genero = updates.genero

    const { data, error } = await supabase
      .from('pacientes')
      .update(updateData)
      .eq('id', patientId)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error) throw error

    return {
      ...data,
      cpf: data.cpf ? decrypt(data.cpf) : undefined,
    } as Patient
  } catch (error) {
    console.error('Error updating patient:', error)
    throw new Error('Falha ao atualizar paciente')
  }
}

export async function deletePatient(
  supabase: SupabaseClient<Database>,
  userId: string,
  patientId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', patientId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting patient:', error)
    throw new Error('Falha ao excluir paciente')
  }
}

export async function getPatientById(
  supabase: SupabaseClient<Database>,
  userId: string,
  patientId: string
): Promise<Patient | null> {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', patientId)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    if (!data) return null

    return {
      ...data,
      cpf: data.cpf ? decrypt(data.cpf) : undefined,
    } as Patient
  } catch (error) {
    console.error('Error fetching patient:', error)
    throw new Error('Falha ao buscar paciente')
  }
}
