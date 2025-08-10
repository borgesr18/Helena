import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const prisma = new PrismaClient();

export interface NotificationData {
  userId: string;
  tipo: 'lembrete' | 'confirmacao' | 'cancelamento';
  canal: 'email' | 'sms' | 'push' | 'in_app';
  conteudo: string;
  destinatario: string;
}

export class NotificationService {
  private emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  private twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

  async enviarNotificacao(notification: NotificationData): Promise<boolean> {
    try {
      switch (notification.canal) {
        case 'email':
          return await this.enviarEmail(notification);
        case 'sms':
          return await this.enviarSMS(notification);
        case 'push':
          return await this.enviarPush(notification);
        case 'in_app':
          return await this.criarNotificacaoInApp(notification);
        default:
          return false;
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return false;
    }
  }

  private async enviarEmail(notification: NotificationData): Promise<boolean> {
    const info = await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'Helena <noreply@helena.com>',
      to: notification.destinatario,
      subject: `Helena - ${notification.tipo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4D9DE0;">Helena - Assistente Médica</h2>
          <p>${notification.conteudo}</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            Esta é uma mensagem automática do sistema Helena.
          </p>
        </div>
      `
    });

    return !!info.messageId;
  }

  private async enviarSMS(notification: NotificationData): Promise<boolean> {
    if (!this.twilioClient) {
      console.warn('Twilio not configured, skipping SMS notification');
      return false;
    }

    const message = await this.twilioClient.messages.create({
      body: `Helena: ${notification.conteudo}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: notification.destinatario
    });

    return message.status === 'sent' || message.status === 'queued';
  }

  private async enviarPush(notification: NotificationData): Promise<boolean> {
    console.log('Push notification:', notification);
    return true;
  }

  private async criarNotificacaoInApp(notification: NotificationData): Promise<boolean> {
    await prisma.auditoriaCompliance.create({
      data: {
        user_id: notification.userId,
        tipo_evento: 'notificacao_inapp',
        descricao: notification.conteudo,
        dados_evento: {
          tipo: notification.tipo,
          canal: notification.canal
        }
      }
    });

    return true;
  }

  async processarNotificacoesPendentes(): Promise<void> {
    const notificacoesPendentes = await prisma.notificacaoConsulta.findMany({
      where: {
        status: 'pendente',
        agendado_para: {
          lte: new Date()
        }
      },
      include: {
        consulta: {
          include: {
            paciente: true
          }
        }
      }
    });

    type ConsultaIncluida = {
      paciente: {
        email?: string | null;
        telefone?: string | null;
        nome: string;
      }
    }

    for (const notif of notificacoesPendentes) {
      const consulta = notif.consulta as unknown as ConsultaIncluida;
      const destinatario = consulta.paciente.email || consulta.paciente.telefone || '';

      const sucesso = await this.enviarNotificacao({
        userId: notif.user_id,
        tipo: notif.tipo as 'lembrete' | 'confirmacao' | 'cancelamento',
        canal: notif.canal as 'email' | 'sms' | 'push' | 'in_app',
        conteudo: notif.conteudo,
        destinatario
      });

      await prisma.notificacaoConsulta.update({
        where: { id: notif.id },
        data: {
          status: sucesso ? 'enviado' : 'falhou',
          enviado_em: sucesso ? new Date() : null
        }
      });
    }
  }
}

export const notificationService = new NotificationService();
