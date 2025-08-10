import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth-server';
import { cfmValidationService } from '@/lib/cfmValidationService';
import { complianceAuditService } from '@/lib/complianceAuditService';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { crm, uf } = await request.json();
    
    if (!crm || !uf) {
      return NextResponse.json(
        { error: 'CRM e UF são obrigatórios' },
        { status: 400 }
      );
    }

    const validation = await cfmValidationService.validateCRM(crm, uf);
    
    if (!validation) {
      return NextResponse.json(
        { error: 'CRM não encontrado ou inválido' },
        { status: 404 }
      );
    }

    await cfmValidationService.linkValidationToUser(user.id, crm, uf);

    await complianceAuditService.logFromRequest(request, {
      userId: user.id,
      clinicaId: undefined,
      tipo: 'validacao_cfm',
      descricao: 'Validação CFM realizada',
      dados: { crm, uf, situacao: validation.situacao }
    });

    return NextResponse.json(validation);
  } catch (error) {
    console.error('Error validating CFM:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
