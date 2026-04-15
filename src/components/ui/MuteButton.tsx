import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Theme';

interface Props {
  muted: boolean;
  onToggle: () => void;
}

export default function MuteButton({ muted, onToggle }: Props) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.btn} activeOpacity={0.7}>
      <Text style={styles.icon}>{muted ? '♪̸' : '♪'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 16, 10, 0.6)',
    borderWidth: 1,
    borderColor: Colors.bgPanelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: Colors.paperMuted,
    fontSize: 16,
  },
});
