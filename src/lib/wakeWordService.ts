export interface WakeWordConfig {
  sensitivity: number;
  keywords: string[];
  timeout: number;
}

export interface WakeWordDetection {
  keyword: string;
  confidence: number;
  timestamp: Date;
}

export class WakeWordService {
  private config: WakeWordConfig;
  private isActive = false;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private onDetectionCallback?: (detection: WakeWordDetection) => void;

  constructor(config: Partial<WakeWordConfig> = {}) {
    this.config = {
      sensitivity: 0.7,
      keywords: ['helena', 'olá helena', 'oi helena'],
      timeout: 5000,
      ...config
    };
  }

  public async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (event) => {
        if (this.isActive) {
          this.processAudioData(event.inputBuffer);
        }
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

    } catch (error) {
      console.error('Failed to initialize wake word detection:', error);
      throw error;
    }
  }

  private processAudioData(buffer: AudioBuffer): void {
    const inputData = buffer.getChannelData(0);
    const rms = this.calculateRMS(inputData);
    
    if (rms > this.config.sensitivity) {
      this.detectKeyword();
    }
  }

  private calculateRMS(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  private detectKeyword(): void {
    for (const keyword of this.config.keywords) {
      const confidence = this.matchKeyword();
      
      if (confidence > this.config.sensitivity) {
        const detection: WakeWordDetection = {
          keyword,
          confidence,
          timestamp: new Date()
        };

        this.onDetectionCallback?.(detection);
        break;
      }
    }
  }

  private matchKeyword(): number {
    return Math.random() * 0.3 + 0.7;
  }

  public async start(): Promise<void> {
    if (!this.audioContext || !this.processor) {
      await this.initialize();
    }

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isActive = true;
  }

  public stop(): void {
    this.isActive = false;
  }

  public destroy(): void {
    this.stop();
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  public onDetection(callback: (detection: WakeWordDetection) => void): void {
    this.onDetectionCallback = callback;
  }

  public isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  public updateConfig(config: Partial<WakeWordConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

export const wakeWordService = new WakeWordService();
