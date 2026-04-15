import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Voice input (SpeechRecognition) + voice output (SpeechSynthesis).
 * Web-only — all methods no-op on native.
 */
export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ─── INPUT: hold to talk ───────────────────────────────────────────────────

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (Platform.OS !== 'web') return;
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    // Stop any ongoing monkey speech so it doesn't collide
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'en-US';
    r.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      if (transcript.trim()) onResult(transcript.trim());
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    r.start();
    recognitionRef.current = r;
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  // ─── OUTPUT: monkey speaks ─────────────────────────────────────────────────

  const speak = useCallback((text: string) => {
    if (Platform.OS !== 'web' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Strip any asterisk stage directions e.g. *scratches behind ear*
    const clean = text.replace(/\*[^*]+\*/g, '').trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.82;   // deliberate, unhurried
    utterance.pitch = 0.62;  // deep
    utterance.volume = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Ordered preference — deep/male/UK/US narrators
      const PREF = [
        'Google UK English Male',
        'Daniel',     // macOS UK English — deep
        'Arthur',     // macOS UK English
        'Alex',       // macOS default (deep)
        'Fred',       // macOS retro deep
        'Google US English Male',
        'Microsoft David Desktop',
        'Microsoft Mark Desktop',
      ];
      for (const name of PREF) {
        const v = voices.find((x) => x.name === name);
        if (v) return v;
      }
      // Fallback: any English male, then any English
      return (
        voices.find((v) => v.lang.startsWith('en') && /male/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en-GB')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        null
      );
    };

    const doSpeak = () => {
      const v = pickVoice();
      if (v) utterance.voice = v;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
    }
  }, []);

  const cancelSpeech = useCallback(() => {
    if (Platform.OS === 'web' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { isListening, isSpeaking, startListening, stopListening, speak, cancelSpeech };
}
