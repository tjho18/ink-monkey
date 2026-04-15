import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Theme';

interface WispConfig {
  id: number;
  xPercent: number;
  yPercent: number;   // starting Y position (bottom area)
  width: number;
  height: number;
  duration: number;
  delay: number;
}

const WISPS: WispConfig[] = [
  { id: 0, xPercent: 30, yPercent: 62, width: 24, height: 50, duration: 3800, delay: 0 },
  { id: 1, xPercent: 45, yPercent: 58, width: 18, height: 40, duration: 4200, delay: 900 },
  { id: 2, xPercent: 55, yPercent: 60, width: 22, height: 45, duration: 3600, delay: 1800 },
  { id: 3, xPercent: 68, yPercent: 63, width: 16, height: 36, duration: 4500, delay: 500 },
];

function SteamWisp({ config }: { config: WispConfig }) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleX = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(0.25, { duration: config.duration * 0.3, easing: Easing.out(Easing.quad) }),
          withTiming(0.12, { duration: config.duration * 0.4, easing: Easing.linear }),
          withTiming(0, { duration: config.duration * 0.3, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      )
    );

    translateY.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(-config.height * 2, {
          duration: config.duration,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      )
    );

    scaleX.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: config.duration * 0.5, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.7, { duration: config.duration * 0.5, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scaleX: scaleX.value },
    ],
  }));

  const x = (config.xPercent / 100) * screenWidth - config.width / 2;
  const y = (config.yPercent / 100) * screenHeight;

  return (
    <Animated.View
      style={[
        styles.wisp,
        {
          left: x,
          top: y,
          width: config.width,
          height: config.height,
          borderRadius: config.width / 2,
        },
        style,
      ]}
    />
  );
}

export default function SteamLayer() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {WISPS.map((w) => (
        <SteamWisp key={w.id} config={w} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wisp: {
    position: 'absolute',
    backgroundColor: Colors.steam,
  },
});
