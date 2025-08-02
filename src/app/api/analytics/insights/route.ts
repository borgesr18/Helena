import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyticsService } from '@/lib/analyticsService';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicaId = searchParams.get('clinicaId') || undefined;

    const insights = await analyticsService.getPredictiveInsights(user.id, clinicaId);

    return NextResponse.json(insights);

  } catch (error) {
    console.error('Analytics insights error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
