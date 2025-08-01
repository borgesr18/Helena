import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { savePrescription, getUserPrescriptions } from '@/lib/prescriptionService'
import { PrescricaoData } from '@/types/prescription'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const prescricoes = await getUserPrescriptions(session.user.id)
    return NextResponse.json(prescricoes)

  } catch (error) {
    console.error('Error in GET /api/prescricoes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { paciente, medicamento, posologia, observacoes } = body as PrescricaoData

    if (!paciente || !medicamento || !posologia) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: paciente, medicamento, posologia' },
        { status: 400 }
      )
    }

    const prescricaoData: PrescricaoData = {
      paciente,
      medicamento,
      posologia,
      observacoes: observacoes || ''
    }

    const savedPrescricao = await savePrescription(session.user.id, prescricaoData)
    return NextResponse.json(savedPrescricao, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/prescricoes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
