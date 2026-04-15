import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Message } from '../../types/Chat';
import { Colors, Radii, Spacing, Typography } from '../../constants/Theme';

interface Props {
  message: Message;
  isStreaming?: boolean;
  streamContent?: string;
}

export default function MessageBubble({ message, isStreaming, streamContent }: Props) {
  const isUser = message.role === 'user';
  const content = isStreaming && streamContent !== undefined ? streamContent : message.content;

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowMonkey]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleMonkey]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textMonkey]}>
          {content}
          {isStreaming && <Text style={styles.cursor}>▌</Text>}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  rowMonkey: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.bubble,
    borderWidth: 1,
  },
  bubbleMonkey: {
    backgroundColor: Colors.monkeyBubbleBg,
    borderColor: Colors.monkeyBubbleBorder,
    borderBottomLeftRadius: Radii.bubbleTail,
  },
  bubbleUser: {
    backgroundColor: Colors.userBubbleBg,
    borderColor: Colors.userBubbleBorder,
    borderBottomRightRadius: Radii.bubbleTail,
  },
  text: {
    fontSize: Typography.sizeBody,
    lineHeight: Typography.lineHeightRelaxed,
    fontFamily: Typography.serif,
  },
  textMonkey: {
    color: Colors.monkeyText,
  },
  textUser: {
    color: Colors.userText,
  },
  cursor: {
    color: Colors.paperMuted,
    opacity: 0.7,
  },
});
