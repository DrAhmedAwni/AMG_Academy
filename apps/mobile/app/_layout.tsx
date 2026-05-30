import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/lib/auth';
import { queryClient } from '../src/lib/queryClient';
import { colors, ThemeProvider } from '../src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <View style={styles.root}>
              <StatusBar barStyle="light-content" backgroundColor={colors.background.main} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background.main },
                  animation: 'fade',
                }}
              />
            </View>
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
});
