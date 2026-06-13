import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { AuthProvider } from '../src/lib/auth';
import { queryClient } from '../src/lib/queryClient';
import { GoogleAuthProvider } from '../src/features/auth/googleAuth';
import { colors, ThemeProvider } from '../src/theme';
import { SplashVideo } from '../src/components/layout/SplashVideo';

WebBrowser.maybeCompleteAuthSession();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if already prevented on re-render
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashFinished, setSplashFinished] = useState(false);
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const handleSplashFinish = useCallback(async () => {
    setSplashFinished(true);
    await SplashScreen.hideAsync();
  }, []);

  if (!fontsLoaded || !splashFinished) {
    return (
      <SplashVideo
        videoSource={require('../assets/splash-video.mp4')}
        onFinish={handleSplashFinish}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <GoogleAuthProvider>
              <View style={styles.root}>
                <StatusBar
                  barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                  backgroundColor={colors.background.main}
                />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background.main },
                    animation: 'fade',
                  }}
                />
              </View>
            </GoogleAuthProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
