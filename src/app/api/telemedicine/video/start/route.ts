import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { telemedicineService } from '@/lib/telemedicineService';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { consultaId } = await request.json();

    if (!consultaId) {
      return NextResponse.json({ error: 'ID da consulta é obrigatório' }, { status: 400 });
    }

    const videoSession = await telemedicineService.iniciarSessaoVideo(consultaId, session.user.id);
    return NextResponse.json(videoSession);

  } catch (error) {
    console.error('Erro ao iniciar sessão de vídeo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
