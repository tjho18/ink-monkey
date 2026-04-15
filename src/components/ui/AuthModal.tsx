import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radii, Spacing, Typography } from '../../constants/Theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export default function AuthModal({
  visible,
  onClose,
  onSignIn,
  onSignUp,
  loading,
  error,
}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return;
    const ok =
      mode === 'signin'
        ? await onSignIn(email.trim(), password)
        : await onSignUp(email.trim(), password);
    if (ok) onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {mode === 'signin' ? 'Return to the inn' : 'First visit?'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'signin'
              ? 'Sign in to restore your conversations across devices.'
              : 'Create an account to save your conversations to the cloud.'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="your email"
            placeholderTextColor={Colors.inputPlaceholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            style={styles.input}
            placeholder="password"
            placeholderTextColor={Colors.inputPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType={mode === 'signup' ? 'newPassword' : 'password'}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.paperWarm} size="small" />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>
              {mode === 'signin' ? 'No account yet? Register' : 'Already registered? Sign in'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.inkDark,
    borderRadius: 20,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.bgPanelBorder,
  },
  title: {
    color: Colors.paperWarm,
    fontSize: Typography.sizeMedium,
    fontFamily: Typography.serif,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.paperMuted,
    fontSize: Typography.sizeSmall,
    fontFamily: Typography.serif,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radii.input,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Colors.inputText,
    fontSize: Typography.sizeBody,
    marginBottom: Spacing.md,
  },
  error: {
    color: '#c97b7b',
    fontSize: Typography.sizeSmall,
    marginBottom: Spacing.md,
  },
  submitBtn: {
    backgroundColor: Colors.sendButton,
    borderRadius: Radii.button,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitText: {
    color: Colors.sendButtonText,
    fontSize: Typography.sizeBody,
    fontFamily: Typography.serif,
  },
  switchBtn: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  switchText: {
    color: Colors.paperMuted,
    fontSize: Typography.sizeSmall,
    fontFamily: Typography.serif,
  },
  cancelBtn: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.inputPlaceholder,
    fontSize: Typography.sizeSmall,
    fontFamily: Typography.serif,
  },
});
