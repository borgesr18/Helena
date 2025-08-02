import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from './auth';

const prisma = new PrismaClient();

export interface ConsultaData {
  paciente_id: string;
  tipo: 'presencial' | 'video' | 'telefone';
  data_agendamento: Date;
  duracao_minutos: number;
  observacoes?: string;
}

export interface ConsultaWithDetails {
  id: string;
  paciente: {
    id: string;
    nome: string;
    cpf?: string;
  };
  tipo: string;
  status: string;
  data_agendamento: Date;
  duracao_minutos: number;
  link_video?: string;
  observacoes?: string;
  created_at: Date;
}

export class TelemedicineService {
  async agendarConsulta(userId: string, clinicaId: string, consultaData: ConsultaData): Promise<ConsultaWithDetails> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const consulta = await prisma.consulta.create({
      data: {
        user_id: userId,
        clinica_id: clinicaId,
        paciente_id: consultaData.paciente_id,
        tipo: consultaData.tipo,
        data_agendamento: consultaData.data_agendamento,
        duracao_minutos: consultaData.duracao_minutos,
        observacoes: consultaData.observacoes,
        link_video: consultaData.tipo === 'video' ? `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : null
      },
      include: {
        paciente: {
          select: { id: true, nome: true, cpf: true }
        }
      }
    });

    await this.agendarNotificacoes(consulta.id, userId, consulta.data_agendamento);

    return {
      id: consulta.id,
      paciente: {
        id: consulta.paciente.id,
        nome: consulta.paciente.nome,
        cpf: consulta.paciente.cpf || undefined
      },
      tipo: consulta.tipo,
      status: consulta.status,
      data_agendamento: consulta.data_agendamento,
      duracao_minutos: consulta.duracao_minutos,
      link_video: consulta.link_video || undefined,
      observacoes: consulta.observacoes || undefined,
      created_at: consulta.created_at
    };
  }

  async getConsultas(userId: string, clinicaId?: string): Promise<ConsultaWithDetails[]> {
    const whereClause = clinicaId 
      ? { user_id: userId, clinica_id: clinicaId }
      : { user_id: userId };

    const consultas = await prisma.consulta.findMany({
      where: whereClause,
      include: {
        paciente: {
          select: { id: true, nome: true, cpf: true }
        }
      },
      orderBy: { data_agendamento: 'asc' }
    });

    return consultas.map(consulta => ({
      id: consulta.id,
      paciente: {
        id: consulta.paciente.id,
        nome: consulta.paciente.nome,
        cpf: consulta.paciente.cpf || undefined
      },
      tipo: consulta.tipo,
      status: consulta.status,
      data_agendamento: consulta.data_agendamento,
      duracao_minutos: consulta.duracao_minutos,
      link_video: consulta.link_video || undefined,
      observacoes: consulta.observacoes || undefined,
      created_at: consulta.created_at
    }));
  }

  async iniciarSessaoVideo(consultaId: string, userId: string): Promise<{ roomId: string; peerId: string }> {
    const consulta = await prisma.consulta.findFirst({
      where: { id: consultaId, user_id: userId }
    });

    if (!consulta) throw new Error('Consulta não encontrada');
    if (consulta.tipo !== 'video') throw new Error('Consulta não é do tipo vídeo');

    const peerId = `peer-${userId}-${Date.now()}`;
    const roomId = consulta.link_video!;

    await prisma.sessaoVideo.upsert({
      where: { id: consultaId },
      update: {
        medico_peer_id: peerId,
        status: 'ativa',
        iniciada_em: new Date()
      },
      create: {
        consulta_id: consultaId,
        room_id: roomId,
        medico_peer_id: peerId,
        status: 'ativa',
        iniciada_em: new Date()
      }
    });

    return { roomId, peerId };
  }

  private async agendarNotificacoes(consultaId: string, userId: string, dataConsulta: Date): Promise<void> {
    const notificacoes = [
      {
        tipo: 'lembrete',
        canal: 'email',
        conteudo: 'Lembrete: Você tem uma consulta agendada em 24 horas',
        agendado_para: new Date(dataConsulta.getTime() - 24 * 60 * 60 * 1000)
      },
      {
        tipo: 'lembrete',
        canal: 'push',
        conteudo: 'Lembrete: Sua consulta começará em 30 minutos',
        agendado_para: new Date(dataConsulta.getTime() - 30 * 60 * 1000)
      }
    ];

    for (const notif of notificacoes) {
      await prisma.notificacaoConsulta.create({
        data: {
          consulta_id: consultaId,
          user_id: userId,
          ...notif
        }
      });
    }
  }
}

export const telemedicineService = new TelemedicineService();
