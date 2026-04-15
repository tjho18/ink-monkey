import React, { useState, useEffect, Platform } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import MainScreen from './src/screens/MainScreen';
import SplashScreen from './src/screens/SplashScreen';
import { Colors } from './src/constants/Theme';

// expo-splash-screen only works on native — skip on web to avoid silent crash
let SplashScreenExpo: { preventAutoHideAsync: () => void; hideAsync: () => Promise<void> } | null = null;
if (Platform.OS !== 'web') {
  SplashScreenExpo = require('expo-splash-screen');
  SplashScreenExpo!.preventAutoHideAsync();
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          NotoSerifJP: require('./assets/fonts/NotoSerifJP-Regular.ttf'),
        });
      } catch {
        // Font load failure is non-fatal — system serif fallback
      } finally {
        setFontsLoaded(true);
        if (SplashScreenExpo) {
          try { await SplashScreenExpo.hideAsync(); } catch {}
        }
      }
    }
    loadFonts();
  }, []);

  // On web, render immediately (no blocking); on native, wait for fonts
  if (!fontsLoaded && Platform.OS !== 'web') return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        <MainScreen />
        {showCustomSplash && (
          <SplashScreen onDone={() => setShowCustomSplash(false)} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});
