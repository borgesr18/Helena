import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export type AuditEventType = 
  | 'assinatura_digital'
  | 'validacao_cfm'
  | 'emissao_prescricao'
  | 'acesso_sistema'
  | 'alteracao_dados'
  | 'exportacao_pdf';

export interface AuditEvent {
  userId: string;
  clinicaId?: string;
  tipo: AuditEventType;
  descricao: string;
  dados?: Record<string, string | number | boolean | null>;
  ipOrigem?: string;
  userAgent?: string;
}

export class ComplianceAuditService {
  async logEvent(event: AuditEvent): Promise<void> {
    try {
      await prisma.auditoriaCompliance.create({
        data: {
          user_id: event.userId,
          clinica_id: event.clinicaId,
          tipo_evento: event.tipo,
          descricao: event.descricao,
          dados_evento: event.dados ? JSON.parse(JSON.stringify(event.dados)) : null,
          ip_origem: event.ipOrigem,
          user_agent: event.userAgent
        }
      });
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  async logFromRequest(request: NextRequest, event: Omit<AuditEvent, 'ipOrigem' | 'userAgent'>): Promise<void> {
    const ipOrigem = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await this.logEvent({
      ...event,
      ipOrigem,
      userAgent
    });
  }

  async getAuditTrail(userId: string, clinicaId?: string, limit = 100): Promise<unknown[]> {
    const where: Record<string, unknown> = { user_id: userId };
    if (clinicaId) {
      where.clinica_id = clinicaId;
    }

    return await prisma.auditoriaCompliance.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        clinica: {
          select: { nome: true }
        }
      }
    });
  }

  async getComplianceReport(clinicaId: string, startDate: Date, endDate: Date): Promise<unknown> {
    const events = await prisma.auditoriaCompliance.findMany({
      where: {
        clinica_id: clinicaId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    const summary = events.reduce((acc: Record<string, number>, event: { tipo_evento: string }) => {
      acc[event.tipo_evento] = (acc[event.tipo_evento] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      periodo: { inicio: startDate, fim: endDate },
      totalEventos: events.length,
      resumoPorTipo: summary,
      eventos: events
    };
  }
}

export const complianceAuditService = new ComplianceAuditService();
