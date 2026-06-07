import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Screen } from '../src/components/layout/Screen';
import { Button, GlassCard } from '../src/components/ui';
import { ErrorState } from '../src/components/states/ErrorState';
import { GoogleProfileCompletion } from '../src/features/auth/GoogleProfileCompletion';
import { useGoogleAuth } from '../src/features/auth/googleAuth';
import { colors, spacing, textStyles } from '../src/theme';

WebBrowser.maybeCompleteAuthSession();

export default function OAuthRedirectScreen() {
  const router = useRouter();
  const googleAuth = useGoogleAuth();

  if (googleAuth.profileStep) {
    return (
      <Screen contentStyle={styles.screen}>
        <GlassCard style={styles.card}>
          <GoogleProfileCompletion
            idToken={googleAuth.profileStep.idToken}
            profile={googleAuth.profileStep.profile}
            loading={googleAuth.loading}
            error={googleAuth.error}
            onCancel={googleAuth.cancelProfile}
            onSubmit={googleAuth.completeProfile}
          />
        </GlassCard>
      </Screen>
    );
  }

  if (googleAuth.error) {
    return (
      <Screen scroll={false} contentStyle={styles.screen}>
        <ErrorState
          title={googleAuth.error.title}
          message={googleAuth.error.message}
          retryLabel="Try Google again"
          onRetry={() => {
            void googleAuth.start();
          }}
        />
        <Button
          label="Back to sign in"
          variant="ghost"
          onPress={() => router.replace('/(auth)/login' as never)}
        />
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={colors.accent.primary} />
      <Text style={styles.text}>Completing Google sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
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
