import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from './auth';

const prisma = new PrismaClient();

export interface EntregaData {
  prescricao_id: string;
  farmacia_parceira: string;
  endereco_entrega: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    cep: string;
    uf: string;
  };
  observacoes?: string;
}

export interface EntregaWithDetails {
  id: string;
  prescricao: {
    id: string;
    paciente: string;
    medicamento: string;
    posologia: string;
  };
  farmacia_parceira: string;
  status: string;
  endereco_entrega: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    cep: string;
    uf: string;
  } | null;
  valor_total?: number;
  codigo_rastreamento?: string;
  data_estimada?: Date;
  data_entrega?: Date;
  created_at: Date;
}

export class PharmacyService {
  async solicitarEntrega(userId: string, clinicaId: string, entregaData: EntregaData): Promise<EntregaWithDetails> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const prescricao = await prisma.prescricao.findFirst({
      where: {
        id: entregaData.prescricao_id,
        user_id: userId
      }
    });

    if (!prescricao) throw new Error('Prescrição não encontrada');

    const valorEstimado = this.calcularValorEstimado(prescricao.medicamento);
    const dataEstimada = new Date();
    dataEstimada.setDate(dataEstimada.getDate() + 2); // 2 dias úteis

    const entrega = await prisma.entregaMedicamento.create({
      data: {
        prescricao_id: entregaData.prescricao_id,
        user_id: userId,
        clinica_id: clinicaId,
        farmacia_parceira: entregaData.farmacia_parceira,
        endereco_entrega: entregaData.endereco_entrega,
        valor_total: valorEstimado,
        data_estimada: dataEstimada,
        observacoes: entregaData.observacoes,
        codigo_rastreamento: `HLN${Date.now().toString().slice(-8)}`
      }
    });

    return {
      id: entrega.id,
      prescricao: {
        id: prescricao.id,
        paciente: prescricao.paciente,
        medicamento: prescricao.medicamento,
        posologia: prescricao.posologia
      },
      farmacia_parceira: entrega.farmacia_parceira,
      status: entrega.status,
      endereco_entrega: entrega.endereco_entrega && typeof entrega.endereco_entrega === 'object' && !Array.isArray(entrega.endereco_entrega) 
        ? entrega.endereco_entrega as {
            rua: string;
            numero: string;
            complemento?: string;
            bairro: string;
            cidade: string;
            cep: string;
            uf: string;
          }
        : null,
      valor_total: entrega.valor_total?.toNumber(),
      codigo_rastreamento: entrega.codigo_rastreamento || undefined,
      data_estimada: entrega.data_estimada || undefined,
      data_entrega: entrega.data_entrega || undefined,
      created_at: entrega.created_at
    };
  }

  async getEntregas(userId: string, clinicaId?: string): Promise<EntregaWithDetails[]> {
    const whereClause = clinicaId 
      ? { user_id: userId, clinica_id: clinicaId }
      : { user_id: userId };

    const entregas = await prisma.entregaMedicamento.findMany({
      where: whereClause,
      include: {
        prescricao: {
          select: {
            id: true,
            paciente: true,
            medicamento: true,
            posologia: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return entregas.map((entrega) => ({
      id: entrega.id,
      prescricao: entrega.prescricao,
      farmacia_parceira: entrega.farmacia_parceira,
      status: entrega.status,
      endereco_entrega: entrega.endereco_entrega && typeof entrega.endereco_entrega === 'object' && !Array.isArray(entrega.endereco_entrega) 
        ? entrega.endereco_entrega as {
            rua: string;
            numero: string;
            complemento?: string;
            bairro: string;
            cidade: string;
            cep: string;
            uf: string;
          }
        : null,
      valor_total: entrega.valor_total?.toNumber(),
      codigo_rastreamento: entrega.codigo_rastreamento || undefined,
      data_estimada: entrega.data_estimada || undefined,
      data_entrega: entrega.data_entrega || undefined,
      created_at: entrega.created_at
    }));
  }

  async atualizarStatusEntrega(entregaId: string, novoStatus: string, userId: string): Promise<void> {
    await prisma.entregaMedicamento.update({
      where: {
        id: entregaId,
        user_id: userId
      },
      data: {
        status: novoStatus,
        data_entrega: novoStatus === 'entregue' ? new Date() : undefined
      }
    });
  }

  async getFarmaciasDisponiveis(): Promise<Array<{ nome: string; endereco: string; telefone: string }>> {
    return [
      {
        nome: 'Farmácia Popular',
        endereco: 'Rua das Flores, 123 - Centro',
        telefone: '(11) 1234-5678'
      },
      {
        nome: 'Drogaria São Paulo',
        endereco: 'Av. Paulista, 456 - Bela Vista',
        telefone: '(11) 8765-4321'
      },
      {
        nome: 'Farmácia Pague Menos',
        endereco: 'Rua Augusta, 789 - Consolação',
        telefone: '(11) 5555-0000'
      }
    ];
  }

  private calcularValorEstimado(medicamento: string): number {
    const medicamentoLower = medicamento.toLowerCase();
    if (medicamentoLower.includes('amoxicilina')) return 25.90;
    if (medicamentoLower.includes('dipirona')) return 8.50;
    if (medicamentoLower.includes('paracetamol')) return 12.30;
    return 35.00; // Valor padrão
  }
}

export const pharmacyService = new PharmacyService();
