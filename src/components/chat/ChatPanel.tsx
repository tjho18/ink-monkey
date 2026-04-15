import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Message } from '../../types/Chat';
import MessageList from './MessageList';
import InputBar from './InputBar';
import { Colors } from '../../constants/Theme';

interface Props {
  messages: Message[];
  isThinking: boolean;
  streamingContent: string;
  onSend: (text: string) => void;
  isListening?: boolean;
  onVoicePressIn?: () => void;
  onVoicePressOut?: () => void;
}

export default function ChatPanel({
  messages,
  isThinking,
  streamingContent,
  onSend,
  isListening,
  onVoicePressIn,
  onVoicePressOut,
}: Props) {
  const insets = useSafeAreaInsets();

  // Backdrop blur works on web; on native it's ignored gracefully
  const webBlur: any =
    Platform.OS === 'web' ? { backdropFilter: 'blur(14px)' } : {};

  return (
    <KeyboardAvoidingView
      style={styles.kavWrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.panel, { paddingBottom: insets.bottom + 4 }, webBlur]}>
        <View style={styles.handle} />

        {/* flex:1 wrapper keeps MessageList from growing past panel bounds */}
        <View style={styles.messageArea}>
          <MessageList
            messages={messages}
            isThinking={isThinking}
            streamingContent={streamingContent}
          />
        </View>

        <InputBar
          onSend={onSend}
          disabled={isThinking}
          isListening={isListening}
          onVoicePressIn={onVoicePressIn}
          onVoicePressOut={onVoicePressOut}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kavWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '52%',
  },
  panel: {
    flex: 1,
    backgroundColor: Colors.bgPanel,
    borderTopWidth: 1,
    borderTopColor: Colors.bgPanelBorder,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    minHeight: 180,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.bgPanelBorder,
    marginTop: 8,
    marginBottom: 4,
  },
  messageArea: {
    flex: 1,
    minHeight: 80,
  },
});
