import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getPrescriptionById } from '@/lib/prescriptionService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const prescricao = await getPrescriptionById(session.user.id, params.id)
    
    if (!prescricao) {
      return NextResponse.json(
        { error: 'Prescrição não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(prescricao)

  } catch (error) {
    console.error('Error in GET /api/prescricoes/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
