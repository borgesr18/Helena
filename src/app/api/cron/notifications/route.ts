import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationService } = await import('@/lib/notificationService');
    await notificationService.processarNotificacoesPendentes();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notificações processadas com sucesso' 
    });

  } catch (error) {
    console.error('Erro no processamento de notificações:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
