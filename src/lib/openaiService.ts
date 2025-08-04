import OpenAI from 'openai'
import { getUserPrescriptions } from '@/lib/prescriptionService'

export interface PrescricaoData {
  paciente: string
  medicamento: string
  posologia: string
  observacoes: string
}

export class OpenAIService {
  private openai: OpenAI | null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('OPENAI_API_KEY não está definida nas variáveis de ambiente')
      this.openai = null
      return
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    })
  }

  async gerarPrescricao(transcricao: string): Promise<PrescricaoData> {
    if (!this.openai) {
      throw new Error('OpenAI client não configurado')
    }
    try {
      const prompt = `
Você é um assistente médico especializado em interpretar comandos de voz para gerar prescrições médicas estruturadas.

Analise o seguinte comando de voz transcrito e extraia as informações para criar uma prescrição médica estruturada:

"${transcricao}"

Retorne APENAS um JSON válido com os seguintes campos obrigatórios:
- paciente: nome completo do paciente
- medicamento: nome do medicamento com dosagem
- posologia: instruções de como tomar (frequência, duração, etc.)
- observacoes: informações adicionais (pode ser string vazia se não houver)

Regras importantes:
1. Se não conseguir identificar o paciente, use "Paciente não identificado"
2. Se não conseguir identificar o medicamento, use "Medicamento não especificado"
3. Se não conseguir identificar a posologia, use "Posologia não especificada"
4. Mantenha as informações exatamente como transcritas, apenas organizando-as nos campos corretos
5. Não adicione informações que não estejam na transcrição
6. Retorne APENAS o JSON, sem texto adicional

Exemplo de resposta esperada:
{
  "paciente": "João Silva",
  "medicamento": "Amoxicilina 500mg",
  "posologia": "1 comprimido de 8 em 8 horas por 7 dias",
  "observacoes": "Tomar após as refeições"
}
`

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente médico especializado em interpretar comandos de voz para gerar prescrições médicas estruturadas. Sempre retorne apenas JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      })

      const responseContent = completion.choices[0]?.message?.content?.trim()
      
      if (!responseContent) {
        throw new Error('Resposta vazia da OpenAI')
      }

      const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Formato de resposta inválido da OpenAI')
      }

      const prescricaoData = JSON.parse(jsonMatch[0]) as PrescricaoData

      if (!prescricaoData.paciente || !prescricaoData.medicamento || !prescricaoData.posologia) {
        throw new Error('Campos obrigatórios ausentes na resposta da IA')
      }

      if (typeof prescricaoData.observacoes !== 'string') {
        prescricaoData.observacoes = ''
      }

      return prescricaoData

    } catch (error) {
      console.error('Erro ao gerar prescrição com OpenAI:', error)
      
      if (error instanceof SyntaxError) {
        throw new Error('Erro ao processar resposta da IA: formato JSON inválido')
      }
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Erro desconhecido ao processar comando de voz')
    }
  }

  async gerarPrescricaoComContexto(
    transcricao: string,
    pacienteNome: string,
    userId: string
  ): Promise<PrescricaoData> {
    if (!this.openai) {
      throw new Error('OpenAI client não configurado')
    }
    try {
      const historico = await this.getPatientHistory(pacienteNome, userId);
      const contextualPrompt = this.buildContextualPrompt(transcricao, pacienteNome, historico);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente médico especializado com acesso ao histórico do paciente. Use o contexto para gerar prescrições mais precisas e detectar possíveis problemas.'
          },
          {
            role: 'user',
            content: contextualPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 800,
      });

      const responseContent = completion.choices[0]?.message?.content?.trim();
      if (!responseContent) {
        throw new Error('Resposta vazia da OpenAI');
      }

      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato de resposta inválido da OpenAI');
      }

      const prescricaoData = JSON.parse(jsonMatch[0]) as PrescricaoData;

      if (!prescricaoData.paciente || !prescricaoData.medicamento || !prescricaoData.posologia) {
        throw new Error('Campos obrigatórios ausentes na resposta da IA');
      }

      if (typeof prescricaoData.observacoes !== 'string') {
        prescricaoData.observacoes = '';
      }

      return prescricaoData;
    } catch (error) {
      console.error('Erro ao gerar prescrição contextual:', error);
      throw error;
    }
  }

  private async getPatientHistory(pacienteNome: string, userId: string) {
    try {
      const prescricoes = await getUserPrescriptions(userId);
      return prescricoes
        .filter(p => p.paciente.toLowerCase() === pacienteNome.toLowerCase())
        .slice(-5)
        .map(p => ({
          medicamento: p.medicamento,
          posologia: p.posologia,
          data: p.criado_em.toString(),
          observacoes: p.observacoes
        }));
    } catch (error) {
      console.error('Erro ao buscar histórico do paciente:', error);
      return [];
    }
  }

  private buildContextualPrompt(transcricao: string, pacienteNome: string, historico: Array<{medicamento: string; posologia: string; data: string; observacoes: string}>): string {
    let prompt = `Analise o seguinte comando de voz para prescrição médica:\n\n"${transcricao}"\n\n`;
    
    if (historico.length > 0) {
      prompt += `HISTÓRICO DO PACIENTE ${pacienteNome}:\n`;
      historico.forEach((item, index) => {
        prompt += `${index + 1}. ${item.medicamento} - ${item.posologia} (${new Date(item.data).toLocaleDateString('pt-BR')})\n`;
        if (item.observacoes) {
          prompt += `   Observações: ${item.observacoes}\n`;
        }
      });
      prompt += '\n';
    }

    prompt += `Considerando o histórico acima, gere uma prescrição em formato JSON com os campos:
- paciente: nome do paciente
- medicamento: nome do medicamento
- posologia: dosagem e frequência
- observacoes: observações relevantes (incluindo alertas sobre histórico se necessário)

IMPORTANTE: Se detectar possíveis interações com medicamentos anteriores ou padrões preocupantes no histórico, inclua alertas nas observações.

Retorne APENAS o JSON, sem texto adicional.`;

    return prompt;
  }
}

export const openaiService = new OpenAIService()
