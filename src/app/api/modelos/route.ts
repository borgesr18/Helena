import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getUserTemplates, createTemplate, CreateTemplateData } from '@/lib/templatesService'

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

    const templates = await getUserTemplates(session.user.id)
    return NextResponse.json(templates)

  } catch (error) {
    console.error('Error in GET /api/modelos:', error)
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
    const { nome, categoria, especialidade, medicamento, posologia, observacoes } = body as CreateTemplateData

    if (!nome || !medicamento || !posologia) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, medicamento, posologia' },
        { status: 400 }
      )
    }

    const templateData: CreateTemplateData = {
      nome,
      categoria,
      especialidade,
      medicamento,
      posologia,
      observacoes
    }

    const template = await createTemplate(session.user.id, templateData)
    return NextResponse.json(template, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/modelos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
