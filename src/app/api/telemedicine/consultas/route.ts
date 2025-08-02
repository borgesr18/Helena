import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { telemedicineService } from '@/lib/telemedicineService';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const consultas = await telemedicineService.getConsultas(session.user.id);
    return NextResponse.json(consultas);

  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { paciente_id, tipo, data_agendamento, duracao_minutos, observacoes } = body;

    if (!paciente_id || !tipo || !data_agendamento) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 });
    }

    const consulta = await telemedicineService.agendarConsulta(
      session.user.id,
      'clinic-id', // TODO: Get from user context
      {
        paciente_id,
        tipo,
        data_agendamento: new Date(data_agendamento),
        duracao_minutos: duracao_minutos || 30,
        observacoes
      }
    );

    return NextResponse.json(consulta, { status: 201 });

  } catch (error) {
    console.error('Erro ao agendar consulta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
