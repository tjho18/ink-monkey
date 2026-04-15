import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { loadMuted, saveMuted } from '../services/storage.service';

// Place your ambient.mp3 at app/assets/audio/ambient.mp3
// If the file doesn't exist yet, audio will simply not play.
let audioAsset: number | null = null;
try {
  audioAsset = require('../../assets/audio/ambient.mp3');
} catch {
  audioAsset = null;
}

export function useAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const storedMuted = await loadMuted();
      if (!mounted) return;
      setMuted(storedMuted);

      if (!audioAsset) return; // No audio file yet

      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          audioAsset,
          {
            isLooping: true,
            volume: 0.4,
            shouldPlay: !storedMuted,
          }
        );

        if (!mounted) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        setReady(true);
      } catch {
        // Audio init failure is non-fatal
      }
    }

    init();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  async function toggleMute() {
    const newMuted = !muted;
    setMuted(newMuted);
    await saveMuted(newMuted);

    if (!soundRef.current) return;
    if (newMuted) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }

  return { muted, toggleMute, audioReady: ready };
}
