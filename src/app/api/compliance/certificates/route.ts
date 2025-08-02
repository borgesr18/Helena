import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { icpBrasilService } from '@/lib/icpBrasilService';
import { complianceAuditService } from '@/lib/complianceAuditService';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const certificates = await icpBrasilService.getUserCertificates(user.id);
    return NextResponse.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { certificateData } = await request.json();
    
    if (!certificateData) {
      return NextResponse.json(
        { error: 'Dados do certificado são obrigatórios' },
        { status: 400 }
      );
    }

    const certificate = await icpBrasilService.validateCertificate(certificateData);
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificado inválido' },
        { status: 400 }
      );
    }

    const certificateId = await icpBrasilService.storeCertificate(
      user.id,
      null,
      certificate
    );

    await complianceAuditService.logFromRequest(request, {
      userId: user.id,
      clinicaId: undefined,
      tipo: 'acesso_sistema',
      descricao: 'Certificado digital cadastrado',
      dados: { certificateId, type: certificate.type }
    });

    return NextResponse.json({ certificateId, certificate });
  } catch (error) {
    console.error('Error storing certificate:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
