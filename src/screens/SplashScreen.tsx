import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text } from 'react-native';
import { Colors, Typography } from '../constants/Theme';

interface Props {
  onDone: () => void;
}

const BG = require('../../assets/background/onsen-bg.png');

export default function SplashScreen({ onDone }: Props) {
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.delay(400),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(bgOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    ]).start(() => {
      onDone();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>
      <Image source={BG} style={styles.bg} resizeMode="cover" />
      <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
        品川の猿
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: textOpacity }]}>
        ink monkey
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  title: {
    color: Colors.paperWarm,
    fontSize: 36,
    fontFamily: Typography.serif,
    letterSpacing: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: Colors.paperMuted,
    fontSize: Typography.sizeSmall,
    fontFamily: Typography.serif,
    letterSpacing: 4,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
