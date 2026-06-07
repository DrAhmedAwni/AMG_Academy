import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { colors, spacing, textStyles } from '../src/theme';

WebBrowser.maybeCompleteAuthSession();

export default function OAuthRedirectScreen() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/(auth)/login' as never);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={colors.accent.primary} />
      <Text style={styles.text}>Completing Google sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background.main,
    padding: spacing.lg,
  },
  text: {
    ...textStyles.body,
    textAlign: 'center',
  },
});
