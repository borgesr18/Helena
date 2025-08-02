import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { emrService } from '@/lib/emrService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const history = await emrService.getPatientMedicalHistory(params.id, user.id);

    if (!history) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(history);

  } catch (error) {
    console.error('EMR patient history error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
