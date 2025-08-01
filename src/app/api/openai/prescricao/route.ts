import { NextRequest, NextResponse } from 'next/server'
import { openaiService, PrescricaoData } from '@/lib/openaiService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcricao } = body

    if (!transcricao || typeof transcricao !== 'string') {
      return NextResponse.json(
        { error: 'Campo "transcricao" é obrigatório e deve ser uma string' },
        { status: 400 }
      )
    }

    if (transcricao.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcrição não pode estar vazia' },
        { status: 400 }
      )
    }

    const prescricaoData: PrescricaoData = await openaiService.gerarPrescricao(transcricao)

    return NextResponse.json(prescricaoData, { status: 200 })

  } catch (error) {
    console.error('Erro na API de prescrição:', error)

    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        return NextResponse.json(
          { error: 'Configuração da API OpenAI não encontrada' },
          { status: 500 }
        )
      }

      if (error.message.includes('formato JSON inválido') || 
          error.message.includes('Formato de resposta inválido')) {
        return NextResponse.json(
          { error: 'Erro ao processar resposta da IA. Tente novamente.' },
          { status: 400 }
        )
      }

      if (error.message.includes('Campos obrigatórios ausentes')) {
        return NextResponse.json(
          { error: 'IA não conseguiu extrair informações suficientes do comando. Tente ser mais específico.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
