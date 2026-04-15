import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Theme';

const SNOWFLAKE_COUNT = 18;

interface SnowflakeConfig {
  id: number;
  xPercent: number;  // 0–100
  size: number;      // 3–8
  duration: number;  // 7000–15000ms fall time
  driftAmp: number;  // ±10–20px horizontal drift
  delay: number;     // stagger
  opacity: number;   // 0.5–0.9
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

const CONFIGS: SnowflakeConfig[] = Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => ({
  id: i,
  xPercent: randomBetween(2, 98),
  size: randomBetween(3, 7),
  duration: randomBetween(7000, 16000),
  driftAmp: randomBetween(10, 22),
  delay: randomBetween(0, 8000),
  opacity: randomBetween(0.5, 0.88),
}));

function Snowflake({ config }: { config: SnowflakeConfig }) {
  const { height, width } = useWindowDimensions();
  const translateY = useSharedValue(-config.size * 2);
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(height + 20, {
          duration: config.duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    translateX.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(config.driftAmp, { duration: config.duration / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(-config.driftAmp, { duration: config.duration / 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  const x = (config.xPercent / 100) * width;

  return (
    <Animated.View
      style={[
        styles.flake,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          left: x,
          opacity: config.opacity,
        },
        style,
      ]}
    />
  );
}

export default function SnowflakeLayer() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {CONFIGS.map((cfg) => (
        <Snowflake key={cfg.id} config={cfg} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flake: {
    position: 'absolute',
    top: 0,
    backgroundColor: Colors.snow,
  },
});
