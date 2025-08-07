// Sistema de validação para APIs
import { PrescricaoData } from '@/types/prescription';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: unknown;
}

// Validação para dados de prescrição
export function validatePrescricaoData(data: unknown): ValidationResult {
  const errors: string[] = [];

  // Verificar se o objeto existe e não é nulo
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Dados da prescrição são obrigatórios']
    };
  }

  // Type guard para verificar se é um objeto com as propriedades necessárias
  const dataObj = data as Record<string, unknown>;

  // Validar paciente
  if (!dataObj.paciente || typeof dataObj.paciente !== 'string') {
    errors.push('Nome do paciente é obrigatório');
  } else if ((dataObj.paciente as string).trim().length < 2) {
    errors.push('Nome do paciente deve ter pelo menos 2 caracteres');
  } else if ((dataObj.paciente as string).length > 255) {
    errors.push('Nome do paciente não pode ter mais de 255 caracteres');
  }

  // Validar medicamento
  if (!dataObj.medicamento || typeof dataObj.medicamento !== 'string') {
    errors.push('Medicamento é obrigatório');
  } else if ((dataObj.medicamento as string).trim().length < 2) {
    errors.push('Nome do medicamento deve ter pelo menos 2 caracteres');
  } else if ((dataObj.medicamento as string).length > 500) {
    errors.push('Nome do medicamento não pode ter mais de 500 caracteres');
  }

  // Validar posologia
  if (!dataObj.posologia || typeof dataObj.posologia !== 'string') {
    errors.push('Posologia é obrigatória');
  } else if ((dataObj.posologia as string).trim().length < 5) {
    errors.push('Posologia deve ter pelo menos 5 caracteres');
  } else if ((dataObj.posologia as string).length > 1000) {
    errors.push('Posologia não pode ter mais de 1000 caracteres');
  }

  // Validar observações (opcional)
  if (dataObj.observacoes && typeof dataObj.observacoes !== 'string') {
    errors.push('Observações devem ser texto');
  } else if (dataObj.observacoes && (dataObj.observacoes as string).length > 2000) {
    errors.push('Observações não podem ter mais de 2000 caracteres');
  }

  // Sanitizar dados se válidos
  const sanitizedData: PrescricaoData = {
    paciente: typeof dataObj.paciente === 'string' ? dataObj.paciente.trim() : '',
    medicamento: typeof dataObj.medicamento === 'string' ? dataObj.medicamento.trim() : '',
    posologia: typeof dataObj.posologia === 'string' ? dataObj.posologia.trim() : '',
    observacoes: typeof dataObj.observacoes === 'string' ? dataObj.observacoes.trim() : ''
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  };
}

// Validação para dados de paciente
export function validatePacienteData(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Dados do paciente são obrigatórios']
    };
  }

  const dataObj = data as Record<string, unknown>;

  // Validar nome
  if (!dataObj.nome || typeof dataObj.nome !== 'string') {
    errors.push('Nome do paciente é obrigatório');
  } else if ((dataObj.nome as string).trim().length < 2) {
    errors.push('Nome do paciente deve ter pelo menos 2 caracteres');
  } else if ((dataObj.nome as string).length > 255) {
    errors.push('Nome do paciente não pode ter mais de 255 caracteres');
  }

  // Validar CPF (opcional)
  if (dataObj.cpf && typeof dataObj.cpf !== 'string') {
    errors.push('CPF deve ser texto');
  } else if (dataObj.cpf && !isValidCPF(dataObj.cpf as string)) {
    errors.push('CPF inválido');
  }

  // Validar data de nascimento (opcional)
  if (dataObj.data_nascimento && !isValidDate(dataObj.data_nascimento as string)) {
    errors.push('Data de nascimento inválida');
  }

  // Validar gênero (opcional)
  if (dataObj.genero && !['masculino', 'feminino', 'outro', 'prefiro_nao_informar'].includes(dataObj.genero as string)) {
    errors.push('Gênero deve ser: masculino, feminino, outro ou prefiro_nao_informar');
  }

  const sanitizedData = {
    nome: typeof dataObj.nome === 'string' ? dataObj.nome.trim() : '',
    cpf: typeof dataObj.cpf === 'string' ? dataObj.cpf.replace(/\D/g, '') : null,
    data_nascimento: typeof dataObj.data_nascimento === 'string' ? dataObj.data_nascimento : null,
    genero: typeof dataObj.genero === 'string' ? dataObj.genero : null,
    alergias: typeof dataObj.alergias === 'string' ? dataObj.alergias.trim() : null,
    medicamentos_atuais: typeof dataObj.medicamentos_atuais === 'string' ? dataObj.medicamentos_atuais.trim() : null
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  };
}

// Validação para dados de usuário
export function validateUserData(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Dados do usuário são obrigatórios']
    };
  }

  const dataObj = data as Record<string, unknown>;

  // Validar email
  if (!dataObj.email || typeof dataObj.email !== 'string') {
    errors.push('Email é obrigatório');
  } else if (!isValidEmail(dataObj.email as string)) {
    errors.push('Email inválido');
  }

  // Validar senha
  if (!dataObj.password || typeof dataObj.password !== 'string') {
    errors.push('Senha é obrigatória');
  } else if ((dataObj.password as string).length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }

  // Validar nome
  if (!dataObj.nome || typeof dataObj.nome !== 'string') {
    errors.push('Nome é obrigatório');
  } else if ((dataObj.nome as string).trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  // Validar CRM
  if (!dataObj.crm || typeof dataObj.crm !== 'string') {
    errors.push('CRM é obrigatório');
  } else if (!isValidCRM(dataObj.crm as string)) {
    errors.push('CRM inválido');
  }

  const sanitizedData = {
    email: typeof dataObj.email === 'string' ? dataObj.email.toLowerCase().trim() : '',
    password: typeof dataObj.password === 'string' ? dataObj.password : '',
    nome: typeof dataObj.nome === 'string' ? dataObj.nome.trim() : '',
    crm: typeof dataObj.crm === 'string' ? dataObj.crm.toUpperCase().trim() : '',
    especialidade: typeof dataObj.especialidade === 'string' ? dataObj.especialidade.trim() : null
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  };
}

// Funções auxiliares de validação
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  return digit1 === parseInt(cleanCPF.charAt(9)) && digit2 === parseInt(cleanCPF.charAt(10));
}

function isValidCRM(crm: string): boolean {
  // Formato: CRM/UF 123456
  const crmRegex = /^CRM\/[A-Z]{2}\s?\d{4,6}$/i;
  return crmRegex.test(crm.trim());
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  
  // Verificar se é uma data válida
  if (isNaN(date.getTime())) return false;
  
  // Verificar se não é no futuro
  if (date > now) return false;
  
  // Verificar se não é muito antiga (mais de 150 anos)
  const maxAge = new Date();
  maxAge.setFullYear(maxAge.getFullYear() - 150);
  if (date < maxAge) return false;
  
  return true;
}

// Sanitização básica para prevenir XSS
export function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

// Rate limiting simples (em memória)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  
  const current = rateLimitMap.get(identifier);
  
  if (!current || current.resetTime < now) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}