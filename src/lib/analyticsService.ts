import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DashboardMetrics {
  totalPrescriptions: number;
  totalPatients: number;
  averageConsultationTime: number;
  prescriptionsToday: number;
  patientsToday: number;
  growthRate: number;
  topMedications: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  prescriptionsByMonth: Array<{
    month: string;
    count: number;
    revenue?: number;
  }>;
  patientDemographics: {
    ageGroups: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    genderDistribution: Array<{
      gender: string;
      count: number;
      percentage: number;
    }>;
  };
  complianceMetrics: {
    digitalSignatures: number;
    cfmValidations: number;
    sbisSubmissions: number;
    auditScore: number;
  };
}

export interface ReportData {
  id: string;
  type: 'prescriptions' | 'patients' | 'revenue' | 'compliance' | 'medications';
  title: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  data: Record<string, unknown>;
  generatedAt: Date;
  generatedBy: string;
}

export class AnalyticsService {
  async getDashboardMetrics(userId: string, clinicaId?: string): Promise<DashboardMetrics> {
    const whereClause = clinicaId 
      ? { user_id: userId, clinica_id: clinicaId }
      : { user_id: userId };

    const totalPrescriptions = await prisma.prescricao.count({
      where: whereClause
    });

    const totalPatients = await prisma.paciente.count({
      where: { user_id: userId }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const prescriptionsToday = await prisma.prescricao.count({
      where: {
        user_id: userId,
        ...(clinicaId && { clinica_id: clinicaId }),
        criado_em: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const patientsToday = await prisma.paciente.count({
      where: {
        user_id: userId,
        created_at: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentPrescriptions = await prisma.prescricao.count({
      where: {
        user_id: userId,
        ...(clinicaId && { clinica_id: clinicaId }),
        criado_em: {
          gte: thirtyDaysAgo
        }
      }
    });

    const previousPrescriptions = await prisma.prescricao.count({
      where: {
        user_id: userId,
        ...(clinicaId && { clinica_id: clinicaId }),
        criado_em: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    });

    const growthRate = previousPrescriptions > 0 
      ? ((recentPrescriptions - previousPrescriptions) / previousPrescriptions) * 100
      : 0;

    const prescriptions = await prisma.prescricao.findMany({
      where: {
        user_id: userId,
        ...(clinicaId && { clinica_id: clinicaId })
      },
      select: { medicamento: true }
    });

    const medicationCounts: Record<string, number> = {};
    prescriptions.forEach(prescription => {
      const name = prescription.medicamento || 'Medicamento não especificado';
      medicationCounts[name] = (medicationCounts[name] || 0) + 1;
    });

    const topMedications = Object.entries(medicationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalPrescriptions) * 100
      }));

    const prescriptionsByMonth = await this.getPrescriptionsByMonth(userId, clinicaId);

    const patients = await prisma.paciente.findMany({
      where: { user_id: userId },
      select: { data_nascimento: true, genero: true }
    });

    const patientDemographics = this.calculatePatientDemographics(patients);

    const complianceMetrics = await this.getComplianceMetrics(userId, clinicaId);

    return {
      totalPrescriptions,
      totalPatients,
      averageConsultationTime: 15, // Mock data - would calculate from session logs
      prescriptionsToday,
      patientsToday,
      growthRate,
      topMedications,
      prescriptionsByMonth,
      patientDemographics,
      complianceMetrics
    };
  }

  private async getPrescriptionsByMonth(userId: string, clinicaId?: string) {
    const whereClause = clinicaId 
      ? { user_id: userId, clinica_id: clinicaId }
      : { user_id: userId };

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const prescriptions = await prisma.prescricao.findMany({
      where: {
        ...whereClause,
        criado_em: {
          gte: twelveMonthsAgo
        }
      },
      select: {
        criado_em: true
      }
    });

    const monthlyData: Record<string, number> = {};
    
    prescriptions.forEach(prescription => {
      const month = prescription.criado_em.toISOString().substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric' 
        }),
        count
      }));
  }

  private  calculatePatientDemographics(patients: Array<{
    data_nascimento: Date | null;
    genero: string | null;
  }>) {
    const ageGroups = {
      '0-18': 0,
      '19-30': 0,
      '31-50': 0,
      '51-70': 0,
      '70+': 0
    };

    const genderCounts = {
      'Masculino': 0,
      'Feminino': 0,
      'Outro': 0
    };

    const today = new Date();

    patients.forEach(patient => {
      if (patient.data_nascimento) {
        const birthDate = new Date(patient.data_nascimento);
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 30) ageGroups['19-30']++;
        else if (age <= 50) ageGroups['31-50']++;
        else if (age <= 70) ageGroups['51-70']++;
        else ageGroups['70+']++;
      }

      const gender = patient.genero || 'Outro';
      if (gender in genderCounts) {
        genderCounts[gender as keyof typeof genderCounts]++;
      } else {
        genderCounts['Outro']++;
      }
    });

    const total = patients.length;

    return {
      ageGroups: Object.entries(ageGroups).map(([range, count]) => ({
        range,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      })),
      genderDistribution: Object.entries(genderCounts).map(([gender, count]) => ({
        gender,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
    };
  }

  private async getComplianceMetrics(userId: string, clinicaId?: string) {
    const digitalSignatures = await prisma.assinaturaDigital.count({
      where: {
        prescricao: {
          user_id: userId,
          ...(clinicaId && { clinica_id: clinicaId })
        }
      }
    });

    const cfmValidations = await prisma.certificadoDigital.count({
      where: {
        user_id: userId,
        ...(clinicaId && { clinica_id: clinicaId }),
        status: 'ativo'
      }
    });

    const sbisSubmissions = await prisma.sBISSubmission.count({
      where: {
        ...(clinicaId && { clinica_id: clinicaId }),
        status: 'aprovado'
      }
    });

    const totalAudits = await prisma.auditoriaCompliance.count({
      where: {
        user_id: userId,
        ...(clinicaId && { clinica_id: clinicaId })
      }
    });

    const passedAudits = await prisma.auditoriaCompliance.count({
      where: {
        user_id: userId,
        ...(clinicaId && { clinica_id: clinicaId }),
        tipo_evento: 'acesso_sistema'
      }
    });

    const auditScore = totalAudits > 0 ? (passedAudits / totalAudits) * 100 : 100;

    return {
      digitalSignatures,
      cfmValidations,
      sbisSubmissions,
      auditScore: Math.round(auditScore)
    };
  }

  async generateReport(
    type: ReportData['type'],
    dateRange: { start: Date; end: Date },
    userId: string,
    clinicaId?: string
  ): Promise<ReportData> {
    const { getCurrentUser } = await import('./auth');
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const whereClause = {
      user_id: userId,
      ...(clinicaId && { clinica_id: clinicaId }),
      created_at: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    };

    let data: Record<string, unknown>;
    let title: string;

    switch (type) {
      case 'prescriptions':
        data = await this.generatePrescriptionsReport(whereClause);
        title = 'Relatório de Prescrições';
        break;
      case 'patients':
        data = await this.generatePatientsReport(userId);
        title = 'Relatório de Pacientes';
        break;
      case 'revenue':
        data = await this.generateRevenueReport(whereClause);
        title = 'Relatório de Receita';
        break;
      case 'compliance':
        data = await this.generateComplianceReport(userId, clinicaId);
        title = 'Relatório de Compliance';
        break;
      case 'medications':
        data = await this.generateMedicationsReport(whereClause);
        title = 'Relatório de Medicamentos';
        break;
      default:
        throw new Error('Invalid report type');
    }

    return {
      id: `report_${Date.now()}`,
      type,
      title,
      dateRange,
      data,
      generatedAt: new Date(),
      generatedBy: user.email || user.id
    };
  }

  private async generatePrescriptionsReport(whereClause: Record<string, unknown>) {
    const prescriptions = await prisma.prescricao.findMany({
      where: whereClause,
      include: {
        assinaturas: true
      },
      orderBy: { criado_em: 'desc' }
    });

    return {
      total: prescriptions.length,
      signed: prescriptions.filter(p => p.assinaturas.length > 0).length,
      byDay: this.groupByDay(prescriptions),
      details: prescriptions.map(p => ({
        id: p.id,
        patient: p.paciente,
        date: p.criado_em,
        medication: p.medicamento,
        signed: p.assinaturas.length > 0
      }))
    };
  }

  private async generatePatientsReport(userId: string) {
    const patients = await prisma.paciente.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    return {
      total: patients.length,
      active: patients.length, // Will be calculated with prescription counts
      demographics: this.calculatePatientDemographics(patients),
      details: patients.map(p => ({
        id: p.id,
        name: p.nome,
        age: p.data_nascimento ? 
          new Date().getFullYear() - new Date(p.data_nascimento).getFullYear() : null,
        gender: p.genero,
        prescriptions: 0, // Will be calculated separately
        lastVisit: p.updated_at
      }))
    };
  }

  private async generateRevenueReport(whereClause: Record<string, unknown>): Promise<Record<string, unknown>> {
    const prescriptions = await prisma.prescricao.count({ where: whereClause });
    const averageValue = 50; // R$ per prescription
    
    return {
      totalRevenue: prescriptions * averageValue,
      prescriptionCount: prescriptions,
      averagePerPrescription: averageValue,
      projectedMonthly: prescriptions * averageValue * 1.2
    };
  }

  private async generateComplianceReport(userId: string, clinicaId?: string) {
    const metrics = await this.getComplianceMetrics(userId, clinicaId);
    
    const audits = await prisma.auditoriaCompliance.findMany({
      where: {
        user_id: userId,
        ...(clinicaId && { clinica_id: clinicaId })
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    return {
      ...metrics,
      recentAudits: audits.map(audit => ({
        id: audit.id,
        type: audit.tipo_evento,
        description: audit.descricao,
        timestamp: audit.timestamp,
        data: audit.dados_evento
      }))
    };
  }

  private async generateMedicationsReport(whereClause: Record<string, unknown>) {
    const prescriptions = await prisma.prescricao.findMany({
      where: whereClause,
      select: { medicamento: true, criado_em: true }
    });

    const medicationStats: Record<string, {
      count: number;
      firstPrescribed: Date;
      lastPrescribed: Date;
    }> = {};

    prescriptions.forEach(prescription => {
      const name = prescription.medicamento || 'Medicamento não especificado';
      if (!medicationStats[name]) {
        medicationStats[name] = {
          count: 0,
          firstPrescribed: prescription.criado_em,
          lastPrescribed: prescription.criado_em
        };
      }
      medicationStats[name].count++;
      if (prescription.criado_em < medicationStats[name].firstPrescribed) {
        medicationStats[name].firstPrescribed = prescription.criado_em;
      }
      if (prescription.criado_em > medicationStats[name].lastPrescribed) {
        medicationStats[name].lastPrescribed = prescription.criado_em;
      }
    });

    return {
      totalUniqueMedications: Object.keys(medicationStats).length,
      mostPrescribed: Object.entries(medicationStats)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 20)
        .map(([name, stats]) => ({
          name,
          ...stats
        }))
    };
  }

  private groupByDay(items: Array<{ criado_em: Date }>) {
    const groups: Record<string, number> = {};
    items.forEach(item => {
      const day = item.criado_em.toISOString().split('T')[0];
      groups[day] = (groups[day] || 0) + 1;
    });
    return Object.entries(groups).map(([date, count]) => ({ date, count }));
  }

  async getPredictiveInsights(userId: string, clinicaId?: string) {
    const metrics = await this.getDashboardMetrics(userId, clinicaId);
    const insights = [];

    if (metrics.growthRate > 10) {
      insights.push({
        type: 'growth',
        title: 'Crescimento Acelerado',
        description: `Suas prescrições cresceram ${metrics.growthRate.toFixed(1)}% no último mês. Continue assim!`,
        priority: 'high',
        action: 'Considere expandir sua capacidade de atendimento'
      });
    }

    const drugInteractionInsights = await this.analyzeDrugInteractions(userId, clinicaId);
    insights.push(...drugInteractionInsights);

    const patternInsights = await this.analyzePrescriptionPatterns(userId, clinicaId);
    insights.push(...patternInsights);

    if (metrics.topMedications.length > 0) {
      const topMed = metrics.topMedications[0];
      insights.push({
        type: 'medication',
        title: 'Medicamento Mais Prescrito',
        description: `${topMed.name} representa ${topMed.percentage.toFixed(1)}% das suas prescrições`,
        priority: 'medium',
        action: 'Verifique se há alternativas ou protocolos específicos'
      });
    }

    if (metrics.complianceMetrics.auditScore < 80) {
      insights.push({
        type: 'compliance',
        title: 'Atenção ao Compliance',
        description: `Seu score de auditoria está em ${metrics.complianceMetrics.auditScore}%`,
        priority: 'high',
        action: 'Revise os processos de assinatura digital e validação CFM'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  }

  private async analyzeDrugInteractions(userId: string, clinicaId?: string): Promise<Array<{
    type: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    action: string;
  }>> {
    const insights: Array<{
      type: string;
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      action: string;
    }> = [];
    
    const recentPrescriptions = await prisma.prescricao.findMany({
      where: {
        user_id: userId,
        ...(clinicaId && { clinica_id: clinicaId }),
        criado_em: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const medicationCombinations: Record<string, number> = {};
    const patientMedications: Record<string, string[]> = {};

    recentPrescriptions.forEach(prescription => {
      const patient = prescription.paciente;
      if (!patientMedications[patient]) {
        patientMedications[patient] = [];
      }
      patientMedications[patient].push(prescription.medicamento);
    });

    Object.entries(patientMedications).forEach(([, medications]) => {
      if (medications.length > 1) {
        for (let i = 0; i < medications.length; i++) {
          for (let j = i + 1; j < medications.length; j++) {
            const combo = [medications[i], medications[j]].sort().join(' + ');
            medicationCombinations[combo] = (medicationCombinations[combo] || 0) + 1;
          }
        }
      }
    });

    const dangerousCombos = [
      'warfarina + aspirina',
      'digoxina + furosemida',
      'enalapril + espironolactona'
    ];

    Object.entries(medicationCombinations).forEach(([combo, count]) => {
      const isDangerous = dangerousCombos.some(dangerous => 
        combo.toLowerCase().includes(dangerous.toLowerCase())
      );

      if (isDangerous && count > 0) {
        insights.push({
          type: 'drug_interaction',
          title: 'Possível Interação Medicamentosa',
          description: `Detectada combinação ${combo} em ${count} paciente(s)`,
          priority: 'high',
          action: 'Revisar combinações medicamentosas'
        });
      }
    });

    return insights;
  }

  private async analyzePrescriptionPatterns(userId: string, clinicaId?: string): Promise<Array<{
    type: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    action: string;
  }>> {
    const insights: Array<{
      type: string;
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      action: string;
    }> = [];
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const recentPrescriptions = await prisma.prescricao.count({
      where: {
        user_id: userId,
        ...(clinicaId && { clinica_id: clinicaId }),
        criado_em: { gte: thirtyDaysAgo }
      }
    });

    const previousPrescriptions = await prisma.prescricao.count({
      where: {
        user_id: userId,
        ...(clinicaId && { clinica_id: clinicaId }),
        criado_em: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
      }
    });

    if (recentPrescriptions > previousPrescriptions * 1.5) {
      insights.push({
        type: 'pattern',
        title: 'Aumento Significativo de Prescrições',
        description: `Volume de prescrições aumentou ${Math.round((recentPrescriptions / Math.max(previousPrescriptions, 1) - 1) * 100)}% no último mês`,
        priority: 'medium',
        action: 'Monitore a carga de trabalho e considere otimizações'
      });
    }

    return insights;
  }
}

export const analyticsService = new AnalyticsService();
