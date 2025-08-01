import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



export interface DrugInteraction {
  medicamento1: string;
  medicamento2: string;
  severidade: 'leve' | 'moderada' | 'grave';
  descricao: string;
  fonte: string;
}

export class DrugInteractionService {
  async checkInteractions(
    newMedication: string, 
    currentMedications: string[]
  ): Promise<DrugInteraction[]> {
    const interactions: DrugInteraction[] = [];
    
    for (const currentMed of currentMedications) {
      const interaction = await this.findInteraction(newMedication, currentMed);
      if (interaction) {
        interactions.push(interaction);
      }
    }
    
    return interactions;
  }
  
  private async findInteraction(med1: string, med2: string): Promise<DrugInteraction | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cached = await (prisma as any).interacaoMedicamento?.findFirst({
        where: {
          OR: [
            { medicamento1: med1, medicamento2: med2 },
            { medicamento1: med2, medicamento2: med1 }
          ]
        }
      });
      
      if (cached) {
        return {
          medicamento1: cached.medicamento1,
          medicamento2: cached.medicamento2,
          severidade: cached.severidade as 'leve' | 'moderada' | 'grave',
          descricao: cached.descricao,
          fonte: cached.fonte
        };
      }
    } catch (error) {
      console.error('Database interaction error (table may not exist yet):', error);
    }
    
    const interaction = await this.queryRxNormAPI(med1, med2);
    
    if (interaction) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).interacaoMedicamento?.create({
          data: {
            medicamento1: med1,
            medicamento2: med2,
            severidade: interaction.severidade,
            descricao: interaction.descricao,
            fonte: 'rxnorm'
          }
        });
      } catch (error) {
        console.error('Database interaction cache error (table may not exist yet):', error);
      }
    }
    
    return interaction;
  }
  
  private async queryRxNormAPI(med1: string, med2: string): Promise<DrugInteraction | null> {
    try {
      const response = await fetch(`https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${med1}`);
      const data = await response.json();
      
      return this.parseRxNormResponse(data, med1, med2);
    } catch (error) {
      console.error('RxNorm API error:', error);
      return null;
    }
  }
  
  private parseRxNormResponse(data: unknown, med1: string, med2: string): DrugInteraction | null {
    try {
      interface RxNormResponse {
        interactionTypeGroup?: Array<{
          interactionType?: Array<{
            interactionPair?: Array<{
              description?: string;
              severity?: string;
            }>;
          }>;
        }>;
      }
      
      const typedData = data as RxNormResponse;
      if (!typedData.interactionTypeGroup || typedData.interactionTypeGroup.length === 0) {
        return null;
      }
      
      const interactions = typedData.interactionTypeGroup[0]?.interactionType?.[0]?.interactionPair || [];
      
      for (const interaction of interactions) {
        if (interaction.description && interaction.description.toLowerCase().includes(med2.toLowerCase())) {
          return {
            medicamento1: med1,
            medicamento2: med2,
            severidade: this.determineSeverity(interaction.severity || interaction.description),
            descricao: interaction.description || 'Possível interação medicamentosa detectada',
            fonte: 'rxnorm'
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing RxNorm response:', error);
      return null;
    }
  }
  
  private determineSeverity(severityText: string): 'leve' | 'moderada' | 'grave' {
    const text = severityText.toLowerCase();
    if (text.includes('major') || text.includes('severe') || text.includes('grave')) {
      return 'grave';
    } else if (text.includes('moderate') || text.includes('moderada')) {
      return 'moderada';
    }
    return 'leve';
  }
  
  async getPatientCurrentMedications(pacienteNome: string, userId: string): Promise<string[]> {
    try {
      const prescricoes = await prisma.prescricao.findMany({
        where: { 
          user_id: userId,
          paciente: pacienteNome
        },
        orderBy: { criado_em: 'desc' },
        take: 10
      });
      
      const recentMedications = prescricoes
        .filter(p => {
          const daysSince = (Date.now() - new Date(p.criado_em).getTime()) / (1000 * 60 * 60 * 24);
          return daysSince <= 30;
        })
        .map(p => p.medicamento);
      
      return Array.from(new Set(recentMedications));
    } catch (error) {
      console.error('Error getting patient medications:', error);
      return [];
    }
  }
}

export const drugInteractionService = new DrugInteractionService();
