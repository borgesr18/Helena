import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getUserPatients, createPatient, CreatePatientData } from '@/lib/patientsService'

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

    const patients = await getUserPatients(session.user.id)
    return NextResponse.json(patients)

  } catch (error) {
    console.error('Error in GET /api/pacientes:', error)
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
    const { nome, cpf, data_nascimento, genero } = body as CreatePatientData

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const patientData: CreatePatientData = {
      nome,
      cpf,
      data_nascimento,
      genero
    }

    const patient = await createPatient(session.user.id, patientData)
    return NextResponse.json(patient, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/pacientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
