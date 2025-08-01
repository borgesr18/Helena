import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      perfis_usuarios: {
        Row: {
          id: string
          user_id: string
          nome: string
          crm: string
          especialidade: string | null
          tipo: string
          plano: string | null
          ativo_licenca: boolean
          empresa_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          crm: string
          especialidade?: string | null
          tipo?: string
          plano?: string | null
          ativo_licenca?: boolean
          empresa_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          crm?: string
          especialidade?: string | null
          tipo?: string
          plano?: string | null
          ativo_licenca?: boolean
          empresa_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pacientes: {
        Row: {
          id: string
          user_id: string
          nome: string
          cpf: string | null
          data_nascimento: string | null
          genero: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          cpf?: string | null
          data_nascimento?: string | null
          genero?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          cpf?: string | null
          data_nascimento?: string | null
          genero?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prescricoes: {
        Row: {
          id: string
          user_id: string
          paciente_id: string
          data: string
          medicamentos: any
          observacoes: string | null
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paciente_id: string
          data?: string
          medicamentos?: any
          observacoes?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paciente_id?: string
          data?: string
          medicamentos?: any
          observacoes?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      logs_prescricao: {
        Row: {
          id: string
          prescricao_id: string
          user_id: string
          data: string
          tipo_acao: string
          created_at: string
        }
        Insert: {
          id?: string
          prescricao_id: string
          user_id: string
          data?: string
          tipo_acao: string
          created_at?: string
        }
        Update: {
          id?: string
          prescricao_id?: string
          user_id?: string
          data?: string
          tipo_acao?: string
          created_at?: string
        }
      }
    }
  }
}
