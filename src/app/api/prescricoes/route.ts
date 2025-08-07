import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { savePrescription, getUserPrescriptions } from '@/lib/prescriptionService'
import { validatePrescricaoData, checkRateLimit } from '@/lib/validation'
import { PrescricaoData } from '@/types/prescription'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Rate limiting
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitId = `get_prescricoes_${session.user.id}_${clientIp}`
    
    if (!checkRateLimit(rateLimitId, 50, 15 * 60 * 1000)) { // 50 requests per 15 minutes
      return NextResponse.json(
        { error: 'Muitas solicitações. Tente novamente em alguns minutos.' },
        { status: 429 }
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

    // Rate limiting para POST
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitId = `create_prescricao_${session.user.id}_${clientIp}`
    
    if (!checkRateLimit(rateLimitId, 10, 10 * 60 * 1000)) { // 10 requests per 10 minutes
      return NextResponse.json(
        { error: 'Muitas tentativas de criação. Tente novamente em alguns minutos.' },
        { status: 429 }
      )
    }

    // Verificar content-type
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type deve ser application/json' },
        { status: 400 }
      )
    }

    let body;
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'JSON inválido na requisição' },
        { status: 400 }
      )
    }

    // Validação robusta dos dados
    const validation = validatePrescricaoData(body)
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validation.errors 
        },
        { status: 400 }
      )
    }

    // Usar dados sanitizados
    const prescricaoData = validation.sanitizedData as PrescricaoData

    // Verificar tamanho total dos dados
    const dataSize = JSON.stringify(prescricaoData).length
    if (dataSize > 10000) { // 10KB limit
      return NextResponse.json(
        { error: 'Dados da prescrição muito grandes' },
        { status: 413 }
      )
    }

    try {
      const savedPrescricao = await savePrescription(session.user.id, prescricaoData)
      
      // Log da auditoria
      console.log(`Prescrição criada - Usuário: ${session.user.id}, IP: ${clientIp}, Paciente: ${prescricaoData.paciente}`)
      
      return NextResponse.json(savedPrescricao, { status: 201 })
    } catch (saveError) {
      console.error('Error saving prescription:', saveError)
      
      // Não expor detalhes internos do erro
      return NextResponse.json(
        { error: 'Erro ao salvar prescrição. Tente novamente.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in POST /api/prescricoes:', error)
    
    // Log detalhado para debugging, mas resposta genérica para o usuário
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
