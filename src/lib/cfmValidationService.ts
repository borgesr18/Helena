import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CFMValidation {
  crm: string;
  uf: string;
  nome: string;
  especialidade?: string;
  situacao: 'ativo' | 'inativo' | 'suspenso';
  dataInscricao?: Date;
  dataValidacao: Date;
  validoAte: Date;
}

export class CFMValidationService {
  async validateCRM(crm: string, uf: string): Promise<CFMValidation | null> {
    try {
      const cached = await prisma.validacaoCFM.findFirst({
        where: { 
          crm, 
          uf,
          valido_ate: { gt: new Date() }
        }
      });
      
      if (cached) {
        return {
          crm: cached.crm,
          uf: cached.uf,
          nome: cached.nome_medico,
          especialidade: cached.especialidade || undefined,
          situacao: cached.situacao as 'ativo' | 'inativo' | 'suspenso',
          dataInscricao: cached.data_inscricao || undefined,
          dataValidacao: cached.data_validacao,
          validoAte: cached.valido_ate
        };
      }
      
      const validation = await this.queryCFMAPI(crm, uf);
      
      if (validation) {
        const validoAte = new Date();
        validoAte.setDate(validoAte.getDate() + 30);
        
        await prisma.validacaoCFM.upsert({
          where: { crm_uf: { crm, uf } },
          create: {
            user_id: '',
            crm,
            uf,
            nome_medico: validation.nome,
            especialidade: validation.especialidade,
            situacao: validation.situacao,
            data_inscricao: validation.dataInscricao,
            valido_ate: validoAte
          },
          update: {
            nome_medico: validation.nome,
            especialidade: validation.especialidade,
            situacao: validation.situacao,
            data_inscricao: validation.dataInscricao,
            data_validacao: new Date(),
            valido_ate: validoAte
          }
        });
      }
      
      return validation;
    } catch (error) {
      console.error('CFM validation error:', error);
      return null;
    }
  }

  private async queryCFMAPI(crm: string, uf: string): Promise<CFMValidation | null> {
    try {
      const mockValidation: CFMValidation = {
        crm,
        uf,
        nome: 'Dr. João Silva',
        especialidade: 'Clínica Médica',
        situacao: 'ativo',
        dataInscricao: new Date('2010-01-15'),
        dataValidacao: new Date(),
        validoAte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      
      return mockValidation;
    } catch (error) {
      console.error('CFM API error:', error);
      return null;
    }
  }

  async linkValidationToUser(userId: string, crm: string, uf: string): Promise<boolean> {
    try {
      await prisma.validacaoCFM.updateMany({
        where: { crm, uf },
        data: { user_id: userId }
      });
      return true;
    } catch (error) {
      console.error('Error linking CFM validation to user:', error);
      return false;
    }
  }
}

export const cfmValidationService = new CFMValidationService();
