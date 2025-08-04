import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClientComponentClient({
  supabaseUrl,
  supabaseKey: supabaseAnonKey,
});

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
          paciente: string
          medicamento: string
          posologia: string
          observacoes: string
          criado_em: string
        }
        Insert: {
          id?: string
          user_id: string
          paciente: string
          medicamento: string
          posologia: string
          observacoes?: string
          criado_em?: string
        }
        Update: {
          id?: string
          user_id?: string
          paciente?: string
          medicamento?: string
          posologia?: string
          observacoes?: string
          criado_em?: string
        }
      }
      modelos_prescricao: {
        Row: {
          id: string
          user_id: string
          nome: string
          categoria: string | null
          especialidade: string | null
          medicamento: string
          posologia: string
          observacoes: string
          ativo: boolean
          uso_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          categoria?: string | null
          especialidade?: string | null
          medicamento: string
          posologia: string
          observacoes?: string
          ativo?: boolean
          uso_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          categoria?: string | null
          especialidade?: string | null
          medicamento?: string
          posologia?: string
          observacoes?: string
          ativo?: boolean
          uso_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      configuracoes_usuario: {
        Row: {
          id: string
          user_id: string
          tema: string
          modelo_ia: string
          notificacoes_email: boolean
          notificacoes_push: boolean
          backup_automatico: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tema?: string
          modelo_ia?: string
          notificacoes_email?: boolean
          notificacoes_push?: boolean
          backup_automatico?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tema?: string
          modelo_ia?: string
          notificacoes_email?: boolean
          notificacoes_push?: boolean
          backup_automatico?: boolean
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
   clinicas: {
     Row: {
       id: string
       nome: string
       cnpj: string | null
       endereco: string | null
       telefone: string | null
       email: string | null
       plano: string
       ativo: boolean
       max_usuarios: number
       max_pacientes: number
       created_at: string
       updated_at: string
     }
     Insert: {
       id?: string
       nome: string
       cnpj?: string | null
       endereco?: string | null
       telefone?: string | null
       email?: string | null
       plano?: string
       ativo?: boolean
       max_usuarios?: number
       max_pacientes?: number
       created_at?: string
       updated_at?: string
     }
     Update: {
       id?: string
       nome?: string
       cnpj?: string | null
       endereco?: string | null
       telefone?: string | null
       email?: string | null
       plano?: string
       ativo?: boolean
       max_usuarios?: number
       max_pacientes?: number
       created_at?: string
       updated_at?: string
     }
   }
   usuarios_clinica: {
     Row: {
       id: string
       user_id: string
       clinica_id: string
       role: string
       ativo: boolean
       created_at: string
       updated_at: string
     }
     Insert: {
       id?: string
       user_id: string
       clinica_id: string
       role?: string
       ativo?: boolean
       created_at?: string
       updated_at?: string
     }
     Update: {
       id?: string
       user_id?: string
       clinica_id?: string
       role?: string
       ativo?: boolean
       created_at?: string
       updated_at?: string
     }
   }
   interacoes_medicamentos: {
     Row: {
       id: string
       medicamento1: string
       medicamento2: string
       severidade: string
       descricao: string
       fonte: string
       created_at: string
     }
     Insert: {
       id?: string
       medicamento1: string
       medicamento2: string
       severidade: string
       descricao: string
       fonte?: string
       created_at?: string
     }
     Update: {
       id?: string
       medicamento1?: string
       medicamento2?: string
       severidade?: string
       descricao?: string
       fonte?: string
       created_at?: string
     }
   }
 }
}
