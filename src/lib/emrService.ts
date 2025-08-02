import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from './auth';

const prisma = new PrismaClient();

export interface PatientTimeline {
  id: string;
  type: 'prescription' | 'consultation' | 'exam' | 'allergy' | 'medication_change';
  date: Date;
  title: string;
  description: string;
  data: Record<string, unknown>;
  createdBy: string;
}

export interface MedicalHistory {
  patientId: string;
  patientName: string;
  timeline: PatientTimeline[];
  allergies: string[];
  currentMedications: string[];
  chronicConditions: string[];
  lastConsultation: Date | null;
  totalPrescriptions: number;
}

export interface EMRSummary {
  totalPatients: number;
  activePatients: number;
  recentConsultations: number;
  pendingFollowUps: number;
  criticalAlerts: Array<{
    patientId: string;
    patientName: string;
    alert: string;
    severity: 'low' | 'medium' | 'high';
    date: Date;
  }>;
}

export class EMRService {
  async getPatientMedicalHistory(patientId: string, userId: string): Promise<MedicalHistory | null> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const patient = await prisma.paciente.findFirst({
      where: {
        id: patientId,
        user_id: userId
      }
    });

    if (!patient) return null;

    const prescriptions = await prisma.prescricao.findMany({
      where: {
        user_id: userId,
        paciente: patient.nome
      },
      orderBy: { criado_em: 'desc' }
    });

    const timeline: PatientTimeline[] = [];

    prescriptions.forEach(prescription => {
      timeline.push({
        id: prescription.id,
        type: 'prescription',
        date: prescription.criado_em,
        title: `Prescrição: ${prescription.medicamento}`,
        description: prescription.posologia,
        data: {
          medicamento: prescription.medicamento,
          posologia: prescription.posologia,
          observacoes: prescription.observacoes
        },
        createdBy: userId
      });
    });

    if (patient.alergias) {
      timeline.push({
        id: `allergy-${patient.id}`,
        type: 'allergy',
        date: patient.created_at,
        title: 'Alergias Registradas',
        description: patient.alergias,
        data: { allergies: patient.alergias.split(',').map(a => a.trim()) },
        createdBy: userId
      });
    }

    if (patient.medicamentos_atuais) {
      timeline.push({
        id: `current-meds-${patient.id}`,
        type: 'medication_change',
        date: patient.updated_at,
        title: 'Medicamentos Atuais',
        description: patient.medicamentos_atuais,
        data: { medications: patient.medicamentos_atuais.split(',').map(m => m.trim()) },
        createdBy: userId
      });
    }

    timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      patientId: patient.id,
      patientName: patient.nome,
      timeline,
      allergies: patient.alergias ? patient.alergias.split(',').map(a => a.trim()) : [],
      currentMedications: patient.medicamentos_atuais ? patient.medicamentos_atuais.split(',').map(m => m.trim()) : [],
      chronicConditions: [],
      lastConsultation: prescriptions.length > 0 ? prescriptions[0].criado_em : null,
      totalPrescriptions: prescriptions.length
    };
  }

  async getEMRSummary(userId: string, clinicaId?: string): Promise<EMRSummary> {
    const whereClause = clinicaId 
      ? { user_id: userId, clinica_id: clinicaId }
      : { user_id: userId };

    const totalPatients = await prisma.paciente.count({
      where: { user_id: userId }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPrescriptions = await prisma.prescricao.findMany({
      where: {
        ...whereClause,
        criado_em: {
          gte: thirtyDaysAgo
        }
      }
    });

    const activePatients = new Set(recentPrescriptions.map(p => p.paciente)).size;
    const recentConsultations = recentPrescriptions.length;

    const patients = await prisma.paciente.findMany({
      where: { user_id: userId }
    });

    const criticalAlerts: EMRSummary['criticalAlerts'] = [];

    for (const patient of patients) {
      if (patient.alergias && patient.alergias.includes('penicilina')) {
        criticalAlerts.push({
          patientId: patient.id,
          patientName: patient.nome,
          alert: 'Alergia à penicilina registrada',
          severity: 'high',
          date: patient.updated_at
        });
      }

      const lastPrescription = await prisma.prescricao.findFirst({
        where: {
          user_id: userId,
          paciente: patient.nome
        },
        orderBy: { criado_em: 'desc' }
      });

      if (lastPrescription) {
        const daysSinceLastPrescription = Math.floor(
          (new Date().getTime() - lastPrescription.criado_em.getTime()) / (1000 * 60 * 60 * 24)
        );

        const prescriptionCount = await prisma.prescricao.count({
          where: {
            user_id: userId,
            paciente: patient.nome
          }
        });

        if (daysSinceLastPrescription > 90 && prescriptionCount > 3) {
          criticalAlerts.push({
            patientId: patient.id,
            patientName: patient.nome,
            alert: `Sem consulta há ${daysSinceLastPrescription} dias`,
            severity: 'medium',
            date: lastPrescription.criado_em
          });
        }
      }
    }

    return {
      totalPatients,
      activePatients,
      recentConsultations,
      pendingFollowUps: criticalAlerts.filter(a => a.severity === 'medium').length,
      criticalAlerts: criticalAlerts.sort((a, b) => b.date.getTime() - a.date.getTime())
    };
  }

  async searchPatientHistory(query: string, userId: string): Promise<Array<{
    patientId: string;
    patientName: string;
    matchType: 'name' | 'medication' | 'condition';
    matchText: string;
    lastConsultation: Date | null;
  }>> {
    const patients = await prisma.paciente.findMany({
      where: {
        user_id: userId,
        OR: [
          { nome: { contains: query, mode: 'insensitive' } },
          { alergias: { contains: query, mode: 'insensitive' } },
          { medicamentos_atuais: { contains: query, mode: 'insensitive' } }
        ]
      }
    });

    const prescriptions = await prisma.prescricao.findMany({
      where: {
        user_id: userId,
        OR: [
          { medicamento: { contains: query, mode: 'insensitive' } },
          { observacoes: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { criado_em: 'desc' }
    });

    const results: Array<{
      patientId: string;
      patientName: string;
      matchType: 'name' | 'medication' | 'condition';
      matchText: string;
      lastConsultation: Date | null;
    }> = [];

    for (const patient of patients) {
      let matchType: 'name' | 'medication' | 'condition' = 'name';
      let matchText = patient.nome;

      if (patient.nome.toLowerCase().includes(query.toLowerCase())) {
        matchType = 'name';
        matchText = patient.nome;
      } else if (patient.medicamentos_atuais?.toLowerCase().includes(query.toLowerCase())) {
        matchType = 'medication';
        matchText = patient.medicamentos_atuais;
      } else if (patient.alergias?.toLowerCase().includes(query.toLowerCase())) {
        matchType = 'condition';
        matchText = patient.alergias;
      }

      const lastPrescription = await prisma.prescricao.findFirst({
        where: {
          user_id: userId,
          paciente: patient.nome
        },
        orderBy: { criado_em: 'desc' }
      });

      results.push({
        patientId: patient.id,
        patientName: patient.nome,
        matchType,
        matchText,
        lastConsultation: lastPrescription?.criado_em || null
      });
    }

    for (const prescription of prescriptions) {
      const existingResult = results.find(r => r.patientName === prescription.paciente);
      if (!existingResult) {
        results.push({
          patientId: prescription.id,
          patientName: prescription.paciente,
          matchType: 'medication',
          matchText: prescription.medicamento,
          lastConsultation: prescription.criado_em
        });
      }
    }

    return results.slice(0, 20);
  }

  async addTimelineEvent(
    patientId: string,
    event: Omit<PatientTimeline, 'id' | 'createdBy'>,
    userId: string
  ): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await prisma.auditoriaCompliance.create({
      data: {
        user_id: userId,
        tipo_evento: 'emr_event',
        descricao: `Evento EMR adicionado: ${event.title}`,
        dados_evento: JSON.stringify({
          patientId,
          eventType: event.type,
          eventData: event.data
        })
      }
    });
  }
}

export const emrService = new EMRService();
