export interface CRMValidationResult {
  isValid: boolean;
  state?: string;
  error?: string;
}

export function validateCRM(crm: string): CRMValidationResult {
  if (!crm) {
    return { isValid: false, error: 'CRM é obrigatório' };
  }

  const cleanCRM = crm.replace(/[^\d-]/g, '');
  
  const crmRegex = /^(\d{4,6})-([A-Z]{2})$/;
  const match = cleanCRM.match(crmRegex);
  
  if (!match) {
    return { 
      isValid: false, 
      error: 'Formato inválido. Use: NNNNNN-UF (ex: 123456-SP)' 
    };
  }

  const [, number, state] = match;
  
  const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  if (!validStates.includes(state)) {
    return { 
      isValid: false, 
      error: 'Estado inválido. Use sigla válida (ex: SP, RJ, MG)' 
    };
  }

  if (number.length < 4 || number.length > 6) {
    return { 
      isValid: false, 
      error: 'Número do CRM deve ter entre 4 e 6 dígitos' 
    };
  }

  return { isValid: true, state };
}

export function formatCRM(crm: string): string {
  const cleanCRM = crm.replace(/[^\d-A-Za-z]/g, '').toUpperCase();
  
  if (cleanCRM.length <= 6) {
    return cleanCRM;
  }
  
  const numbers = cleanCRM.replace(/[^0-9]/g, '');
  const letters = cleanCRM.replace(/[^A-Z]/g, '');
  
  if (numbers.length > 0 && letters.length > 0) {
    return `${numbers.slice(0, 6)}-${letters.slice(0, 2)}`;
  }
  
  return cleanCRM;
}

export const medicalSpecialties = [
  'Cardiologia', 'Dermatologia', 'Endocrinologia', 'Gastroenterologia',
  'Ginecologia', 'Neurologia', 'Oftalmologia', 'Ortopedia', 'Otorrinolaringologia',
  'Pediatria', 'Pneumologia', 'Psiquiatria', 'Radiologia', 'Urologia',
  'Anestesiologia', 'Cirurgia Geral', 'Cirurgia Plástica', 'Clínica Médica',
  'Medicina de Família', 'Medicina do Trabalho', 'Medicina Intensiva',
  'Medicina Nuclear', 'Patologia', 'Reumatologia', 'Oncologia',
  'Hematologia', 'Infectologia', 'Nefrologia', 'Geriatria', 'Medicina Esportiva'
];
