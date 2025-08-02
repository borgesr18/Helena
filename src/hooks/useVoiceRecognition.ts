'use client';

import { useState, useEffect, useCallback } from 'react';
import { voiceRecognitionService, VoiceRecognitionResult, VoiceCommand } from '@/lib/voiceRecognitionService';
import { wakeWordService } from '@/lib/wakeWordService';

export interface UseVoiceRecognitionOptions {
  autoStart?: boolean;
  language?: string;
  continuous?: boolean;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);

  useEffect(() => {
    setIsSupported(voiceRecognitionService.isSupported());
    
    if (options.autoStart && voiceRecognitionService.isSupported()) {
      startListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.autoStart]);

  useEffect(() => {
    voiceRecognitionService.onResult((result: VoiceRecognitionResult) => {
      setTranscript(result.transcript);
      setConfidence(result.confidence);
      setError(null);
    });

    voiceRecognitionService.onCommand((command: VoiceCommand) => {
      setLastCommand(command);
      if (command.action === 'wake') {
        setWakeWordDetected(true);
        setTimeout(() => setWakeWordDetected(false), 3000);
      }
    });

    voiceRecognitionService.onError((errorMessage: string) => {
      setError(errorMessage);
      setIsListening(false);
    });

    wakeWordService.onDetection(() => {
      setWakeWordDetected(true);
      setTimeout(() => setWakeWordDetected(false), 3000);
    });

    return () => {
      stopListening();
      wakeWordService.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = useCallback(async () => {
    try {
      await voiceRecognitionService.startListening();
      await wakeWordService.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar reconhecimento de voz');
    }
  }, []);

  const stopListening = useCallback(() => {
    voiceRecognitionService.stopListening();
    wakeWordService.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    transcript,
    confidence,
    error,
    lastCommand,
    wakeWordDetected,
    startListening,
    stopListening,
    toggleListening
  };
}
