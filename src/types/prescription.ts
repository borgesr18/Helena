export interface PrescricaoData {
  paciente: string
  medicamento: string
  posologia: string
  observacoes: string
}

export interface PrescricaoResponse extends PrescricaoData {
  success: boolean
}
