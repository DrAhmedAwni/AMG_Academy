import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { loginSchema } from '@amg/shared';
import { Screen } from '../../src/components/layout/Screen';
import { Button, GlassCard, PasswordToggle, TextField } from '../../src/components/ui';
import { ErrorState } from '../../src/components/states/ErrorState';
import { useLoginMutation } from '../../src/features/auth/auth.hooks';
import type { AuthFormErrors, LoginFormValues } from '../../src/features/auth/auth.types';
import { useGoogleAuth } from '../../src/features/auth/googleAuth';
import { mapApiErrorToUi } from '../../src/lib/errors';
import { colors, radius, spacing, textStyles, typography } from '../../src/theme';

function getLoginErrors(values: LoginFormValues): AuthFormErrors {
  const result = loginSchema.safeParse({
    ...values,
    client: 'mobile',
  });

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<AuthFormErrors>((errors, issue) => {
    const field = issue.path[0];
    if (typeof field === 'string') {
      errors[field] = issue.message;
    }
    return errors;
  }, {});
}

export default function LoginScreen() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const googleAuth = useGoogleAuth();
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const uiError = useMemo(
    () => (loginMutation.error
      ? mapApiErrorToUi(loginMutation.error)
      : null),
    [loginMutation.error],
  );

  const submit = async () => {
    const nextErrors = getLoginErrors(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await loginMutation.mutateAsync(values);
    router.replace('/(tabs)/home' as never);
  };

  const updateField = (field: keyof LoginFormValues, value: string) => {
    if (loginMutation.error) {
      loginMutation.reset();
    }
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.hero}>
        <Image
          source={require('../../assets/logo-horizontal.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="AMG Academy"
        />
        <View style={styles.brandPill}>
          <Text style={styles.brandPillText}>Premium dental learning</Text>
        </View>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>
          Continue your courses, events, and clinical discussions.
        </Text>
      </View>

      <GlassCard style={styles.card}>
        <Button
          label="Continue with Google"
          variant="google"
          loading={googleAuth.loading}
          disabled={!googleAuth.requestReady}
          onPress={() => {
            void googleAuth.start();
          }}
        />
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>
        <TextField
          label="Email"
          value={values.email}
          onChangeText={(email) => updateField('email', email)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          error={errors.email}
          required
        />
        <TextField
          label="Password"
          value={values.password}
          onChangeText={(password) => updateField('password', password)}
          secureTextEntry={!showPassword}
          textContentType="password"
          error={errors.password}
          required
          rightAction={
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
            />
          }
        />
        {uiError ? (
          <ErrorState title={uiError.title} message={uiError.message} />
        ) : null}
        <Button
          label="Sign in"
          loading={loginMutation.isPending}
          onPress={() => {
            void submit();
          }}
        />
        <View style={styles.actionRow}>
          <Button
            label="Create account"
            variant="ghost"
            onPress={() => router.push('/(auth)/register' as never)}
            style={styles.actionButton}
          />
          <Button
            label="Forgot password"
            variant="ghost"
            onPress={() => router.push('/(auth)/forgot-password' as never)}
            style={styles.actionButton}
          />
        </View>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 216,
    height: 58,
  },
  brandPill: {
    minHeight: 32,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(248, 198, 109, 0.32)',
    backgroundColor: colors.accent.goldMuted,
    paddingHorizontal: spacing.md,
  },
  brandPillText: {
    ...textStyles.caption,
    color: colors.accent.gold,
    textTransform: 'uppercase',
    fontWeight: typography.weight.bold,
  },
  title: {
    ...textStyles.title,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    textAlign: 'center',
  },
  card: {
    gap: spacing.md,
    borderColor: colors.border.strong,
    padding: spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  actionRow: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
});
