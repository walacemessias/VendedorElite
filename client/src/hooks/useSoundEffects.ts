import { useEffect, useRef } from 'react';

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isEnabledRef = useRef(true);

  useEffect(() => {
    // Criar AudioContext quando o componente montar
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSuccessSound = () => {
    if (!isEnabledRef.current || !audioContextRef.current) return;
    
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Som de sucesso - sequência de notas ascendentes
    const now = context.currentTime;
    oscillator.frequency.setValueAtTime(523, now); // C5
    oscillator.frequency.setValueAtTime(659, now + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, now + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  };

  const playCelebrationSound = () => {
    if (!isEnabledRef.current || !audioContextRef.current) return;
    
    const context = audioContextRef.current;
    
    // Criar múltiplas notas para um som mais festivo
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      const startTime = context.currentTime + (index * 0.1);
      oscillator.frequency.setValueAtTime(frequency, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.8);
    });
  };

  const playNotificationSound = () => {
    if (!isEnabledRef.current || !audioContextRef.current) return;
    
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Som de notificação simples
    const now = context.currentTime;
    oscillator.frequency.setValueAtTime(880, now); // A5
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  };

  const setEnabled = (enabled: boolean) => {
    isEnabledRef.current = enabled;
  };

  return {
    playSuccessSound,
    playCelebrationSound,
    playNotificationSound,
    setEnabled
  };
}