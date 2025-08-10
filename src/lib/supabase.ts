import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { EnderecoEntrega, DadosEvento, Transcriptions, WakeWords, FHIRBundle, ResponseData, QualidadeConexao } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClientComponentClient({
  supabaseUrl: supabaseUrl ?? '',
  supabaseKey: supabaseAnonKey ?? '',
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
          clinica_id: string | null
          nome: string
          cpf: string | null
          data_nascimento: string | null
          genero: string | null
          alergias: string | null
          medicamentos_atuais: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          clinica_id?: string | null
          nome: string
          cpf?: string | null
          data_nascimento?: string | null
          genero?: string | null
          alergias?: string | null
          medicamentos_atuais?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          clinica_id?: string | null
          nome?: string
          cpf?: string | null
          data_nascimento?: string | null
          genero?: string | null
          alergias?: string | null
          medicamentos_atuais?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prescricoes: {
        Row: {
          id: string
          user_id: string
          clinica_id: string | null
          paciente: string
          medicamento: string
          posologia: string
          observacoes: string
          criado_em: string
        }
        Insert: {
          id?: string
          user_id: string
          clinica_id?: string | null
          paciente: string
          medicamento: string
          posologia: string
          observacoes?: string
          criado_em?: string
        }
        Update: {
          id?: string
          user_id?: string
          clinica_id?: string | null
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
          notificacoes_sms: boolean
          notificacoes_consulta: boolean
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
          notificacoes_sms?: boolean
          notificacoes_consulta?: boolean
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
          notificacoes_sms?: boolean
          notificacoes_consulta?: boolean
          backup_automatico?: boolean
          created_at?: string
          updated_at?: string
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
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status_pagamento: string
          data_renovacao: string | null
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
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status_pagamento?: string
          data_renovacao?: string | null
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
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status_pagamento?: string
          data_renovacao?: string | null
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
      certificados_digitais: {
        Row: {
          id: string
          user_id: string
          clinica_id: string | null
          tipo_certificado: string
          numero_serie: string
          emissor: string
          valido_ate: string
          status: string
          thumbprint: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          clinica_id?: string | null
          tipo_certificado: string
          numero_serie: string
          emissor: string
          valido_ate: string
          status?: string
          thumbprint: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          clinica_id?: string | null
          tipo_certificado?: string
          numero_serie?: string
          emissor?: string
          valido_ate?: string
          status?: string
          thumbprint?: string
          created_at?: string
          updated_at?: string
        }
      }
      validacoes_cfm: {
        Row: {
          id: string
          user_id: string
          crm: string
          uf: string
          nome_medico: string
          especialidade: string | null
          situacao: string
          data_inscricao: string | null
          data_validacao: string
          valido_ate: string
          fonte: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          crm: string
          uf: string
          nome_medico: string
          especialidade?: string | null
          situacao: string
          data_inscricao?: string | null
          data_validacao?: string
          valido_ate: string
          fonte?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          crm?: string
          uf?: string
          nome_medico?: string
          especialidade?: string | null
          situacao?: string
          data_inscricao?: string | null
          data_validacao?: string
          valido_ate?: string
          fonte?: string
          created_at?: string
        }
      }
      assinaturas_digitais: {
        Row: {
          id: string
          prescricao_id: string
          certificado_id: string
          user_id: string
          hash_documento: string
          assinatura_digital: string
          timestamp_assinatura: string
          ip_origem: string | null
          user_agent: string | null
          status: string
        }
        Insert: {
          id?: string
          prescricao_id: string
          certificado_id: string
          user_id: string
          hash_documento: string
          assinatura_digital: string
          timestamp_assinatura?: string
          ip_origem?: string | null
          user_agent?: string | null
          status?: string
        }
        Update: {
          id?: string
          prescricao_id?: string
          certificado_id?: string
          user_id?: string
          hash_documento?: string
          assinatura_digital?: string
          timestamp_assinatura?: string
          ip_origem?: string | null
          user_agent?: string | null
          status?: string
        }
      }
      auditoria_compliance: {
        Row: {
          id: string
          user_id: string
          clinica_id: string | null
          tipo_evento: string
          descricao: string
          dados_evento: DadosEvento | null
          ip_origem: string | null
          user_agent: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          clinica_id?: string | null
          tipo_evento: string
          descricao: string
          dados_evento?: DadosEvento | null
          ip_origem?: string | null
          user_agent?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          clinica_id?: string | null
          tipo_evento?: string
          descricao?: string
          dados_evento?: DadosEvento | null
          ip_origem?: string | null
          user_agent?: string | null
          timestamp?: string
        }
      }
      voice_sessions: {
        Row: {
          id: string
          user_id: string
          clinica_id: string | null
          session_start: string
          session_end: string | null
          total_duration: number | null
          commands_detected: number
          transcriptions: Transcriptions[] | null
          wake_words: WakeWords[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          clinica_id?: string | null
          session_start?: string
          session_end?: string | null
          total_duration?: number | null
          commands_detected?: number
          transcriptions?: Transcriptions[] | null
          wake_words?: WakeWords[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          clinica_id?: string | null
          session_start?: string
          session_end?: string | null
          total_duration?: number | null
          commands_detected?: number
          transcriptions?: Transcriptions[] | null
          wake_words?: WakeWords[] | null
          created_at?: string
        }
      }
      sbis_submissions: {
        Row: {
          id: string
          prescricao_id: string
          user_id: string
          clinica_id: string | null
          sbis_id: string | null
          status: string
          fhir_bundle: FHIRBundle | null
          response_data: ResponseData | null
          error_message: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          prescricao_id: string
          user_id: string
          clinica_id?: string | null
          sbis_id?: string | null
          status?: string
          fhir_bundle?: FHIRBundle | null
          response_data?: ResponseData | null
          error_message?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          prescricao_id?: string
          user_id?: string
          clinica_id?: string | null
          sbis_id?: string | null
          status?: string
          fhir_bundle?: FHIRBundle | null
          response_data?: ResponseData | null
          error_message?: string | null
          submitted_at?: string
        }
      }
      consultas: {
        Row: {
          id: string
          user_id: string
          clinica_id: string | null
          paciente_id: string
          tipo: string
          status: string
          data_agendamento: string
          duracao_minutos: number
          link_video: string | null
          gravacao_url: string | null
          observacoes: string | null
          receita_gerada: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          clinica_id?: string | null
          paciente_id: string
          tipo: string
          status?: string
          data_agendamento: string
          duracao_minutos?: number
          link_video?: string | null
          gravacao_url?: string | null
          observacoes?: string | null
          receita_gerada?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          clinica_id?: string | null
          paciente_id?: string
          tipo?: string
          status?: string
          data_agendamento?: string
          duracao_minutos?: number
          link_video?: string | null
          gravacao_url?: string | null
          observacoes?: string | null
          receita_gerada?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notificacoes_consulta: {
        Row: {
          id: string
          consulta_id: string
          user_id: string
          tipo: string
          canal: string
          conteudo: string
          enviado_em: string | null
          status: string
          agendado_para: string
          created_at: string
        }
        Insert: {
          id?: string
          consulta_id: string
          user_id: string
          tipo: string
          canal: string
          conteudo: string
          enviado_em?: string | null
          status?: string
          agendado_para: string
          created_at?: string
        }
        Update: {
          id?: string
          consulta_id?: string
          user_id?: string
          tipo?: string
          canal?: string
          conteudo?: string
          enviado_em?: string | null
          status?: string
          agendado_para?: string
          created_at?: string
        }
      }
      entregas_medicamento: {
        Row: {
          id: string
          prescricao_id: string
          user_id: string
          clinica_id: string | null
          farmacia_parceira: string
          status: string
          endereco_entrega: EnderecoEntrega
          valor_total: number | null
          codigo_rastreamento: string | null
          data_estimada: string | null
          data_entrega: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prescricao_id: string
          user_id: string
          clinica_id?: string | null
          farmacia_parceira: string
          status?: string
          endereco_entrega: EnderecoEntrega
          valor_total?: number | null
          codigo_rastreamento?: string | null
          data_estimada?: string | null
          data_entrega?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prescricao_id?: string
          user_id?: string
          clinica_id?: string | null
          farmacia_parceira?: string
          status?: string
          endereco_entrega?: EnderecoEntrega
          valor_total?: number | null
          codigo_rastreamento?: string | null
          data_estimada?: string | null
          data_entrega?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessoes_video: {
        Row: {
          id: string
          consulta_id: string
          room_id: string
          medico_peer_id: string | null
          paciente_peer_id: string | null
          status: string
          iniciada_em: string | null
          finalizada_em: string | null
          duracao_segundos: number | null
          qualidade_conexao: QualidadeConexao | null
          gravacao_habilitada: boolean
          created_at: string
        }
        Insert: {
          id?: string
          consulta_id: string
          room_id: string
          medico_peer_id?: string | null
          paciente_peer_id?: string | null
          status?: string
          iniciada_em?: string | null
          finalizada_em?: string | null
          duracao_segundos?: number | null
          qualidade_conexao?: QualidadeConexao | null
          gravacao_habilitada?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          consulta_id?: string
          room_id?: string
          medico_peer_id?: string | null
          paciente_peer_id?: string | null
          status?: string
          iniciada_em?: string | null
          finalizada_em?: string | null
          duracao_segundos?: number | null
          qualidade_conexao?: QualidadeConexao | null
          gravacao_habilitada?: boolean
          created_at?: string
        }
      }
    }
  }
}
