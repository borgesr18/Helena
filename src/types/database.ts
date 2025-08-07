// Tipos específicos para campos JSON do banco de dados

export interface EnderecoEntrega {
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface DadosEvento {
  action?: string
  resource?: string
  details?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface Transcriptions {
  text: string
  timestamp: string
  confidence?: number
}

export interface WakeWords {
  word: string
  detected_at: string
  confidence?: number
}

export interface FHIRBundle {
  resourceType: 'Bundle'
  id?: string
  timestamp?: string
  entry?: Array<{
    resource: Record<string, unknown>
  }>
}

export interface ResponseData {
  status?: string
  message?: string
  data?: Record<string, unknown>
}

export interface QualidadeConexao {
  bandwidth?: number
  latency?: number
  packet_loss?: number
  jitter?: number
  timestamp: string
}

// Tipo para dados genéricos JSON quando necessário
export type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONValue[] 
  | { [key: string]: JSONValue }