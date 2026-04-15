import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import { Message } from '../../types/Chat';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from '../monkey/ThinkingIndicator';
import { Spacing } from '../../constants/Theme';

interface Props {
  messages: Message[];
  isThinking: boolean;
  streamingContent: string;
}

export default function MessageList({ messages, isThinking, streamingContent }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  const lastMessage = messages[messages.length - 1];
  const isStreamingLast =
    !isThinking && streamingContent.length > 0 && lastMessage?.role === 'assistant';

  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    if (Platform.OS === 'web') {
      // On web, ScrollView renders as a div — use the underlying DOM node
      const node = (scrollRef.current as any)._nativeTag ?? (scrollRef.current as any).getScrollableNode?.();
      if (node && typeof node.scrollTop !== 'undefined') {
        node.scrollTop = node.scrollHeight;
      } else {
        scrollRef.current.scrollToEnd({ animated: false });
      }
    } else {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    // Small delay so layout has settled before we scroll
    const id = setTimeout(scrollToBottom, 60);
    return () => clearTimeout(id);
  }, [messages.length, streamingContent]);

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={scrollToBottom}
    >
      {messages.map((item, index) => {
        const isLastAssistant =
          item.role === 'assistant' && index === messages.length - 1;
        return (
          <MessageBubble
            key={item.id}
            message={item}
            isStreaming={isLastAssistant && streamingContent.length > 0}
            streamContent={isLastAssistant ? streamingContent : undefined}
          />
        );
      })}
      {isThinking && streamingContent.length === 0 && <ThinkingIndicator />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});
