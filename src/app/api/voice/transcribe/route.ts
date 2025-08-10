import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCurrentUserServer } from '@/lib/auth-server';
import { complianceAuditService } from '@/lib/complianceAuditService';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY não está configurada' }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'pt';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Arquivo de áudio é obrigatório' },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: language,
      response_format: 'verbose_json',
      timestamp_granularities: ['word']
    });

    await complianceAuditService.logFromRequest(request, {
      userId: user.id,
      clinicaId: undefined, // Will be populated by compliance service if needed
      tipo: 'acesso_sistema',
      descricao: 'Transcrição de áudio processada',
      dados: {
        duration: transcription.duration,
        language: language,
        wordCount: transcription.text.split(' ').length
      }
    });

    return NextResponse.json({
      text: transcription.text,
      duration: transcription.duration,
      words: transcription.words,
      language: transcription.language
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Erro na transcrição do áudio' },
      { status: 500 }
    );
  }
}
