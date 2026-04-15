import React, { useEffect } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { MonkeyState } from '../../types/Chat';
import { MONKEY_POSES } from '../../constants/MonkeyPoses';
import BreathingWrapper from './BreathingWrapper';
import { useRef, useState } from 'react';

interface Props {
  state: MonkeyState;
  size?: number;
}

export default function MonkeyDisplay({ state, size = 280 }: Props) {
  const [currentSource, setCurrentSource] = useState<ImageSourcePropType>(MONKEY_POSES[state]);
  const [nextSource, setNextSource] = useState<ImageSourcePropType | null>(null);
  const prevStateRef = useRef<MonkeyState>(state);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;
    const newSource = MONKEY_POSES[state];
    setNextSource(newSource);

    // Fade out current
    opacity.value = withTiming(0, { duration: 400 }, (finished) => {
      if (finished) {
        runOnJS(setCurrentSource)(newSource);
        runOnJS(setNextSource)(null);
        opacity.value = withTiming(1, { duration: 400 });
      }
    });
  }, [state]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <BreathingWrapper>
      <View style={[styles.container, { width: size, height: size }]}>
        {/* Next image sits underneath, revealed as current fades */}
        {nextSource && (
          <Image
            source={nextSource}
            style={[styles.image, { width: size, height: size }]}
            resizeMode="contain"
          />
        )}
        {/* Current image fades out using Reanimated (works correctly on web) */}
        <Animated.Image
          source={currentSource}
          style={[styles.image, styles.top, { width: size, height: size }, animStyle]}
          resizeMode="contain"
        />
      </View>
    </BreathingWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  top: {
    zIndex: 1,
  },
});
