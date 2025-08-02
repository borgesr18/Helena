import { jsPDF } from 'jspdf';
import { ReportData } from './analyticsService';

export async function generatePDFReport(reportData: ReportData): Promise<Buffer> {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Helena - Sistema Médico', 20, 20);
  doc.setFontSize(16);
  doc.text(reportData.title, 20, 35);
  
  doc.setFontSize(10);
  doc.text(`Período: ${reportData.dateRange.start.toLocaleDateString('pt-BR')} - ${reportData.dateRange.end.toLocaleDateString('pt-BR')}`, 20, 50);
  doc.text(`Gerado em: ${reportData.generatedAt.toLocaleDateString('pt-BR')} às ${reportData.generatedAt.toLocaleTimeString('pt-BR')}`, 20, 60);
  doc.text(`Por: ${reportData.generatedBy}`, 20, 70);
  
  const yPosition = 90;
  
  switch (reportData.type) {
    case 'prescriptions':
      addPrescriptionsContent(doc, reportData.data, yPosition);
      break;
    case 'patients':
      addPatientsContent(doc, reportData.data, yPosition);
      break;
    case 'medications':
      addMedicationsContent(doc, reportData.data, yPosition);
      break;
    case 'compliance':
      addComplianceContent(doc, reportData.data, yPosition);
      break;
    case 'revenue':
      addRevenueContent(doc, reportData.data, yPosition);
      break;
  }
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${pageCount}`, 20, 280);
    doc.text('Helena - Assistente Médica de Prescrição', 120, 280);
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}

function addPrescriptionsContent(doc: jsPDF, data: Record<string, unknown>, yPosition: number): number {
  doc.setFontSize(14);
  doc.text('Resumo de Prescrições', 20, yPosition);
  yPosition += 15;
  
  const reportData = data as {
    total: number;
    signed: number;
    details: Array<{
      patient: string;
      date: string;
      signed: boolean;
    }>;
  };
  
  doc.setFontSize(10);
  doc.text(`Total de prescrições: ${reportData.total}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Prescrições assinadas: ${reportData.signed}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Taxa de assinatura: ${((reportData.signed / reportData.total) * 100).toFixed(1)}%`, 20, yPosition);
  yPosition += 20;
  
  doc.text('Prescrições Recentes:', 20, yPosition);
  yPosition += 10;
  
  reportData.details.slice(0, 10).forEach((prescription, index: number) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text(`${index + 1}. ${prescription.patient || 'Paciente não informado'}`, 25, yPosition);
    yPosition += 8;
    doc.text(`   Data: ${new Date(prescription.date).toLocaleDateString('pt-BR')}`, 25, yPosition);
    yPosition += 8;
    doc.text(`   Assinada: ${prescription.signed ? 'Sim' : 'Não'}`, 25, yPosition);
    yPosition += 12;
  });
  
  return yPosition;
}

function addPatientsContent(doc: jsPDF, data: Record<string, unknown>, yPosition: number): number {
  doc.setFontSize(14);
  doc.text('Resumo de Pacientes', 20, yPosition);
  yPosition += 15;
  
  const reportData = data as {
    total: number;
    active: number;
    demographics: {
      ageGroups: Array<{ range: string; count: number; percentage: number }>;
      genderDistribution: Array<{ gender: string; count: number; percentage: number }>;
    };
  };
  
  doc.setFontSize(10);
  doc.text(`Total de pacientes: ${reportData.total}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Pacientes ativos: ${reportData.active}`, 20, yPosition);
  yPosition += 20;
  
  doc.text('Demografia por Idade:', 20, yPosition);
  yPosition += 10;
  
  reportData.demographics.ageGroups.forEach((group) => {
    doc.text(`${group.range}: ${group.count} (${group.percentage.toFixed(1)}%)`, 25, yPosition);
    yPosition += 8;
  });
  
  yPosition += 10;
  doc.text('Distribuição por Gênero:', 20, yPosition);
  yPosition += 10;
  
  reportData.demographics.genderDistribution.forEach((gender) => {
    doc.text(`${gender.gender}: ${gender.count} (${gender.percentage.toFixed(1)}%)`, 25, yPosition);
    yPosition += 8;
  });
  
  return yPosition;
}

function addMedicationsContent(doc: jsPDF, data: Record<string, unknown>, yPosition: number): number {
  doc.setFontSize(14);
  doc.text('Análise de Medicamentos', 20, yPosition);
  yPosition += 15;
  
  const reportData = data as {
    totalUniqueMedications: number;
    mostPrescribed: Array<{ name: string; count: number; firstPrescribed: Date }>;
  };
  
  doc.setFontSize(10);
  doc.text(`Total de medicamentos únicos: ${reportData.totalUniqueMedications}`, 20, yPosition);
  yPosition += 20;
  
  doc.text('Medicamentos Mais Prescritos:', 20, yPosition);
  yPosition += 10;
  
  reportData.mostPrescribed.slice(0, 15).forEach((med, index: number) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text(`${index + 1}. ${med.name}`, 25, yPosition);
    yPosition += 8;
    doc.text(`   Prescrições: ${med.count}`, 25, yPosition);
    yPosition += 8;
    doc.text(`   Primeira prescrição: ${new Date(med.firstPrescribed).toLocaleDateString('pt-BR')}`, 25, yPosition);
    yPosition += 12;
  });
  
  return yPosition;
}

function addComplianceContent(doc: jsPDF, data: Record<string, unknown>, yPosition: number): number {
  doc.setFontSize(14);
  doc.text('Relatório de Compliance', 20, yPosition);
  yPosition += 15;
  
  const reportData = data as {
    digitalSignatures: number;
    cfmValidations: number;
    sbisSubmissions: number;
    auditScore: number;
    recentAudits: Array<{ type: string; description: string; timestamp: Date }>;
  };
  
  doc.setFontSize(10);
  doc.text(`Assinaturas digitais: ${reportData.digitalSignatures}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Validações CFM: ${reportData.cfmValidations}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Submissões SBIS: ${reportData.sbisSubmissions}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Score de auditoria: ${reportData.auditScore}%`, 20, yPosition);
  yPosition += 20;
  
  doc.text('Auditorias Recentes:', 20, yPosition);
  yPosition += 10;
  
  reportData.recentAudits.slice(0, 10).forEach((audit, index: number) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text(`${index + 1}. ${audit.type}`, 25, yPosition);
    yPosition += 8;
    doc.text(`   ${audit.description}`, 25, yPosition);
    yPosition += 8;
    doc.text(`   ${new Date(audit.timestamp).toLocaleDateString('pt-BR')}`, 25, yPosition);
    yPosition += 12;
  });
  
  return yPosition;
}

function addRevenueContent(doc: jsPDF, data: Record<string, unknown>, yPosition: number): number {
  doc.setFontSize(14);
  doc.text('Análise de Receita', 20, yPosition);
  yPosition += 15;
  
  const reportData = data as {
    totalRevenue: number;
    prescriptionCount: number;
    averagePerPrescription: number;
    projectedMonthly: number;
  };
  
  doc.setFontSize(10);
  doc.text(`Receita total: R$ ${reportData.totalRevenue.toFixed(2)}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Número de prescrições: ${reportData.prescriptionCount}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Valor médio por prescrição: R$ ${reportData.averagePerPrescription.toFixed(2)}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Projeção mensal: R$ ${reportData.projectedMonthly.toFixed(2)}`, 20, yPosition);
  
  return yPosition + 20;
}
