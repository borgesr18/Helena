import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicaId = searchParams.get('clinicaId');

    if (!clinicaId) {
      return NextResponse.json({ error: 'clinicaId é obrigatório' }, { status: 400 });
    }

    const clinica = await prisma.clinica.findUnique({ where: { id: clinicaId } });
    if (!clinica) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      status: clinica.status_pagamento || 'ativo',
      plan: clinica.plano,
      nextBilling: clinica.data_renovacao || null,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}