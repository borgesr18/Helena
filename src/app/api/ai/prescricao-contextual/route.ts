import { NextRequest, NextResponse } from 'next/server';
import { getUserContext, hasPermission } from '@/lib/rbac';
import { OpenAIService } from '@/lib/openaiService';
import { drugInteractionService } from '@/lib/drugInteractionService';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const userContext = await getUserContext();
    if (!userContext || !hasPermission(userContext.role, 'medico')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { transcricao, pacienteNome } = await request.json();
    
    if (!transcricao || !pacienteNome) {
      return NextResponse.json(
        { error: 'Transcrição e nome do paciente são obrigatórios' },
        { status: 400 }
      );
    }

    const service = new OpenAIService();
    const prescricaoData = await service.gerarPrescricaoComContexto(
      transcricao,
      pacienteNome,
      userContext.userId
    );

    const currentMedications = await drugInteractionService.getPatientCurrentMedications(
      pacienteNome,
      userContext.userId
    );

    const interactions = await drugInteractionService.checkInteractions(
      prescricaoData.medicamento,
      currentMedications
    );

    return NextResponse.json({
      prescricao: prescricaoData,
      interactions,
      warnings: interactions.filter(i => i.severidade === 'grave'),
      currentMedications
    });

  } catch (error) {
    console.error('Error in contextual prescription:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
