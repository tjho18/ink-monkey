import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

const BG = require('../../../assets/background/onsen-bg.png');

// Pan the background image upward so the open hot-spring water
// sits at the same level as the monkey (not the rocks above it).
const SHIFT_UP = 140;

export default function OnsenBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      {/*
        ImageBackground is positioned SHIFT_UP points above the screen top.
        Its height = screenHeight + SHIFT_UP, so the image covers the full
        screen even though it starts higher.  overflow:hidden on the
        outer container clips the excess above the screen.
      */}
      <ImageBackground
        source={BG}
        style={styles.bg}
        resizeMode="cover"
      >
        {/*
          Counter-shift the children back down so UI elements (monkey, chat)
          are at their normal screen positions despite the shifted parent.
        */}
        <View style={styles.content}>
          {children}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    top: -SHIFT_UP,
    left: 0,
    right: 0,
    bottom: 0,
    // Height is implicitly screenHeight + SHIFT_UP via top/bottom
  },
  content: {
    flex: 1,
    marginTop: SHIFT_UP, // realigns children to true screen top
  },
});
