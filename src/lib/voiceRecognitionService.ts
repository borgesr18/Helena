import { complianceAuditService } from './complianceAuditService';

export interface VoiceRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: Date;
}

export interface VoiceCommand {
  command: string;
  action: string;
  parameters?: Record<string, string>;
  confidence: number;
}

export class VoiceRecognitionService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any | null = null;
  private isListening = false;
  private config: VoiceRecognitionConfig;
  private onResultCallback?: (result: VoiceRecognitionResult) => void;
  private onCommandCallback?: (command: VoiceCommand) => void;
  private onErrorCallback?: (error: string) => void;

  constructor(config: Partial<VoiceRecognitionConfig> = {}) {
    this.config = {
      language: 'pt-BR',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
      ...config
    };

    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      const voiceResult: VoiceRecognitionResult = {
        transcript: transcript.trim(),
        confidence,
        isFinal: result.isFinal,
        timestamp: new Date()
      };

      this.onResultCallback?.(voiceResult);

      if (result.isFinal) {
        this.processCommand(transcript, confidence);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.onErrorCallback?.(event.error);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition?.start();
      }
    };
  }

  private processCommand(transcript: string, confidence: number): void {
    const normalizedText = transcript.toLowerCase().trim();
    
    const commands = [
      {
        patterns: ['helena', 'olá helena', 'oi helena'],
        action: 'wake',
        extract: () => ({})
      },
      {
        patterns: ['prescrever para', 'prescreva para', 'receita para'],
        action: 'prescribe',
        extract: (text: string) => this.extractPrescriptionData(text)
      },
      {
        patterns: ['buscar paciente', 'encontrar paciente', 'procurar paciente'],
        action: 'search_patient',
        extract: (text: string) => ({ query: text.split('paciente')[1]?.trim() || '' })
      },
      {
        patterns: ['novo paciente', 'cadastrar paciente', 'adicionar paciente'],
        action: 'new_patient',
        extract: () => ({})
      },
      {
        patterns: ['salvar prescrição', 'salvar receita', 'gravar prescrição'],
        action: 'save_prescription',
        extract: () => ({})
      },
      {
        patterns: ['imprimir', 'gerar pdf', 'exportar pdf'],
        action: 'export_pdf',
        extract: () => ({})
      }
    ];

    for (const commandDef of commands) {
      for (const pattern of commandDef.patterns) {
        if (normalizedText.includes(pattern)) {
          const command: VoiceCommand = {
            command: pattern,
            action: commandDef.action,
            parameters: commandDef.extract(normalizedText),
            confidence
          };

          this.onCommandCallback?.(command);
          return;
        }
      }
    }
  }

  private extractPrescriptionData(text: string): Record<string, string> {
    const data: Record<string, string> = {};
    
    const patientMatch = text.match(/(?:para|paciente)\s+([^:,]+)/i);
    if (patientMatch) {
      data.patient = patientMatch[1].trim();
    }

    const medicationMatch = text.match(/([^:]+):\s*([^,]+)/);
    if (medicationMatch) {
      data.medication = medicationMatch[1].trim();
      data.dosage = medicationMatch[2].trim();
    }

    const frequencyMatch = text.match(/(\d+)\s*(?:em|a cada)\s*(\d+)\s*horas?/i);
    if (frequencyMatch) {
      data.frequency = `${frequencyMatch[1]} em ${frequencyMatch[2]} horas`;
    }

    const durationMatch = text.match(/(?:por|durante)\s*(\d+)\s*dias?/i);
    if (durationMatch) {
      data.duration = `${durationMatch[1]} dias`;
    }

    return data;
  }

  public startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not available'));
        return;
      }

      if (this.isListening) {
        resolve();
        return;
      }

      this.isListening = true;
      
      try {
        this.recognition.start();
        resolve();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  public onResult(callback: (result: VoiceRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  public onCommand(callback: (command: VoiceCommand) => void): void {
    this.onCommandCallback = callback;
  }

  public onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  public async logVoiceActivity(userId: string, clinicaId?: string): Promise<void> {
    await complianceAuditService.logEvent({
      userId,
      clinicaId,
      tipo: 'acesso_sistema',
      descricao: 'Comando de voz processado',
      dados: {
        timestamp: new Date().toISOString(),
        language: this.config.language
      }
    });
  }
}


export const voiceRecognitionService = new VoiceRecognitionService();
