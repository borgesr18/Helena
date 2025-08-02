import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { emrService } from '@/lib/emrService';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicaId = searchParams.get('clinicaId') || undefined;

    const summary = await emrService.getEMRSummary(user.id, clinicaId);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('EMR summary error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
