import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { sbisService } from '@/lib/sbisService';
import { complianceAuditService } from '@/lib/complianceAuditService';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const profile = await getUserProfile(user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const prescriptionData = await request.json();

    if (!prescriptionData.patientCpf || !prescriptionData.medications) {
      return NextResponse.json(
        { error: 'Dados da prescrição incompletos' },
        { status: 400 }
      );
    }

    if (!sbisService.isConfigured()) {
      return NextResponse.json(
        { error: 'Serviço SBIS não configurado' },
        { status: 503 }
      );
    }

    const sbisData = {
      id: prescriptionData.id,
      patientCpf: prescriptionData.patientCpf,
      patientName: prescriptionData.patientName,
      doctorCrm: profile.crm || 'MOCK-CRM',
      doctorUf: 'SP',
      medications: prescriptionData.medications.map((med: {
        anvisaCode?: string;
        nome: string;
        dosagem: string;
        quantidade: string;
        via: string;
        frequencia: string;
        duracao: string;
        controlado?: boolean;
      }) => ({
        code: med.anvisaCode || 'MOCK-CODE',
        name: med.nome,
        dosage: med.dosagem,
        quantity: parseInt(med.quantidade) || 1,
        instructions: `${med.via} - ${med.frequencia} - ${med.duracao}`,
        controlledSubstance: med.controlado || false
      })),
      digitalSignature: prescriptionData.digitalSignature || '',
      timestamp: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    const result = await sbisService.submitPrescription(sbisData);

    await complianceAuditService.logFromRequest(request, {
      userId: user.id,
      clinicaId: profile.empresa_id,
      tipo: 'emissao_prescricao',
      descricao: 'Prescrição submetida ao SBIS/RNDS',
      dados: {
        prescriptionId: prescriptionData.id,
        sbisResult: result.success,
        environment: sbisService.getEnvironment()
      }
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('SBIS submission error:', error);
    return NextResponse.json(
      { error: 'Erro na submissão para SBIS' },
      { status: 500 }
    );
  }
}
