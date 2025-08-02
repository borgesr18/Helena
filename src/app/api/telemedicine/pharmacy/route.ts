import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { pharmacyService } from '@/lib/pharmacyService';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const entregas = await pharmacyService.getEntregas(session.user.id);
    return NextResponse.json(entregas);

  } catch (error) {
    console.error('Erro ao buscar entregas:', error);
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
    const { prescricao_id, farmacia_parceira, endereco_entrega, observacoes } = body;

    if (!prescricao_id || !farmacia_parceira || !endereco_entrega) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 });
    }

    const entrega = await pharmacyService.solicitarEntrega(
      session.user.id,
      'clinic-id', // TODO: Get from user context
      {
        prescricao_id,
        farmacia_parceira,
        endereco_entrega,
        observacoes
      }
    );

    return NextResponse.json(entrega, { status: 201 });

  } catch (error) {
    console.error('Erro ao solicitar entrega:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
