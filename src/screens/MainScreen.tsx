import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnsenBackground from '../components/scene/OnsenBackground';
import SnowflakeLayer from '../components/scene/SnowflakeLayer';
import SteamLayer from '../components/scene/SteamLayer';
import MonkeyDisplay from '../components/monkey/MonkeyDisplay';
import ChatPanel from '../components/chat/ChatPanel';
import MuteButton from '../components/ui/MuteButton';
import AuthModal from '../components/ui/AuthModal';
import { useChat } from '../hooks/useChat';
import { useAudio } from '../hooks/useAudio';
import { useAuth } from '../hooks/useAuth';
import { useVoice } from '../hooks/useVoice';
import { uploadAllMessages } from '../services/sync.service';
import { Colors } from '../constants/Theme';

// Average iPhone screen ≈ 390 × 844 pt.
// Chat panel takes bottom ~52 % → visible scene is top ~48 % ≈ 405 pt.
// We want the monkey's CENTRE at ≈ 38 % from the top of the full screen
// (= centre of the scene area), with its lower third submerged in the water.
// Using absolute positioning so the percentage refers to screen HEIGHT, not width.
const MONKEY_SIZE = 310;

export default function MainScreen() {
  const { messages, isThinking, monkeyState, streamingContent, sendMessage, setUserId } =
    useChat();
  const { muted, toggleMute } = useAudio();
  const { userId, loading: authLoading, error: authError, signIn, signUp, restoreSession } =
    useAuth();
  const { isListening, startListening, stopListening, speak } = useVoice();
  const [authVisible, setAuthVisible] = useState(false);
  const lastSpokenIdRef = useRef<string>('');

  useEffect(() => {
    restoreSession().then((id) => { if (id) setUserId(id); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userId) { setUserId(userId); uploadAllMessages(userId, messages); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Auto-speak monkey responses
  useEffect(() => {
    if (isThinking || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== 'assistant') return;
    if (last.id === lastSpokenIdRef.current) return;
    lastSpokenIdRef.current = last.id;
    speak(last.content);
  }, [messages, isThinking, speak]);

  const handleVoicePressIn = useCallback(() => {
    startListening((transcript) => sendMessage(transcript));
  }, [startListening, sendMessage]);

  const handleVoicePressOut = useCallback(() => stopListening(), [stopListening]);

  async function handleSignIn(email: string, password: string) {
    const ok = await signIn(email, password);
    if (ok && userId) { setUserId(userId); await uploadAllMessages(userId, messages); }
    return ok;
  }
  async function handleSignUp(email: string, password: string) {
    const ok = await signUp(email, password);
    if (ok && userId) { setUserId(userId); await uploadAllMessages(userId, messages); }
    return ok;
  }

  return (
    <OnsenBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <SnowflakeLayer />
        <SteamLayer />

        {/* Top-right controls */}
        <View style={styles.topBar}>
          <MuteButton muted={muted} onToggle={toggleMute} />
          {!userId && (
            <TouchableOpacity
              onPress={() => setAuthVisible(true)}
              style={styles.syncBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.syncText}>sync</Text>
            </TouchableOpacity>
          )}
        </View>

        {/*
          Monkey — absolutely centred on the full screen.
          `top: '22%'` means 22 % of the SCREEN HEIGHT from the top,
          placing the monkey's visual centre at roughly 38 % from the top —
          the middle of the scene above the chat panel.
          pointerEvents="none" lets taps pass through to the chat input.
        */}
        <View style={styles.monkeyContainer} pointerEvents="none">
          <View style={styles.monkeyWrapper}>
            <MonkeyDisplay state={monkeyState} size={MONKEY_SIZE} />

            {/* Water immersion — colour sampled from the onsen background */}
            <View style={styles.waterBody} pointerEvents="none">
              {/* Subtle foam/haze just at the waterline */}
              <View style={styles.waterFoam} />
              {/* Main shimmer line */}
              <View style={styles.waterRipple} />
            </View>
          </View>
        </View>

        {/* Chat panel */}
        <ChatPanel
          messages={messages}
          isThinking={isThinking}
          streamingContent={streamingContent}
          onSend={sendMessage}
          isListening={isListening}
          onVoicePressIn={handleVoicePressIn}
          onVoicePressOut={handleVoicePressOut}
        />

        <AuthModal
          visible={authVisible}
          onClose={() => setAuthVisible(false)}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          loading={authLoading}
          error={authError}
        />
      </SafeAreaView>
    </OnsenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topBar: {
    position: 'absolute',
    top: 54,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  syncBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 16, 10, 0.6)',
    borderWidth: 1,
    borderColor: Colors.bgPanelBorder,
  },
  syncText: {
    color: Colors.paperMuted,
    fontSize: 12,
    fontFamily: 'NotoSerifJP',
    letterSpacing: 1,
  },

  // ─── Monkey ────────────────────────────────────────────────────────────────

  monkeyContainer: {
    // Cover the full screen so we can centre freely
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    // 22 % from the top → monkey centre lands at ≈ 38 % from top,
    // squarely in the middle of the visible onsen scene.
    justifyContent: 'flex-start',
    paddingTop: '23%',
  },

  monkeyWrapper: {
    position: 'relative',
    width: MONKEY_SIZE,
    height: MONKEY_SIZE,
  },

  // Water body — colour matched to the onsen background water tone.
  // The bg image water is a cool, slightly warm blue-grey (~#8fa8bb).
  waterBody: {
    position: 'absolute',
    bottom: 0,
    left: -44,
    right: -44,
    // Submerge the lower 40 % of the monkey
    height: MONKEY_SIZE * 0.65,
    // Sampled from the background: desaturated teal-grey, gentle opacity
    backgroundColor: 'rgba(128, 158, 176, 0.28)',
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    overflow: 'hidden',
  },

  // Thin diffuse haze just below the waterline (mimics water turbulence / steam)
  waterFoam: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: 'rgba(210, 230, 238, 0.22)',
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
  },

  // Bright shimmer at the precise waterline
  waterRipple: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(215, 238, 248, 0.65)',
  },
});
