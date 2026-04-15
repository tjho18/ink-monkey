import React, { useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radii, Spacing, Typography } from '../../constants/Theme';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  isListening?: boolean;
  onVoicePressIn?: () => void;
  onVoicePressOut?: () => void;
}

export default function InputBar({
  onSend,
  disabled,
  isListening = false,
  onVoicePressIn,
  onVoicePressOut,
}: Props) {
  const [text, setText] = useState('');
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.35, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  function handleSend() {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  }

  const voiceSupported = Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={text}
        onChangeText={setText}
        placeholder={isListening ? 'listening…' : 'speak to the monkey…'}
        placeholderTextColor={
          isListening ? 'rgba(200, 100, 80, 0.7)' : Colors.inputPlaceholder
        }
        multiline
        maxLength={500}
        returnKeyType="send"
        onSubmitEditing={handleSend}
        blurOnSubmit
        editable={!disabled && !isListening}
        selectionColor={Colors.paperWarm}
      />

      {/* Voice button — hold to talk */}
      {voiceSupported && (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
            onPressIn={onVoicePressIn}
            onPressOut={onVoicePressOut}
            disabled={disabled}
            activeOpacity={0.7}
            delayLongPress={0}
          >
            <Text style={styles.voiceBtnText}>{isListening ? '⏹' : '🎙'}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Send button */}
      <TouchableOpacity
        style={[styles.sendBtn, (disabled || !text.trim()) && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={disabled || !text.trim()}
        activeOpacity={0.7}
      >
        <Text style={styles.sendBtnText}>↑</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radii.input,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Colors.inputText,
    fontSize: Typography.sizeBody,
    fontFamily: Typography.serif,
    lineHeight: Typography.lineHeightBody,
    maxHeight: 120,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  voiceBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(80, 60, 30, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 80, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  voiceBtnActive: {
    backgroundColor: 'rgba(160, 50, 30, 0.85)',
    borderColor: 'rgba(240, 120, 80, 0.7)',
  },
  voiceBtnText: {
    fontSize: 17,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.sendButton,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    opacity: 0.3,
  },
  sendBtnText: {
    color: Colors.sendButtonText,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
});
