import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { loginSchema } from '@amg/shared';
import { Screen } from '../../src/components/layout/Screen';
import { Button, GlassCard, PasswordToggle, TextField } from '../../src/components/ui';
import { ErrorState } from '../../src/components/states/ErrorState';
import { useLoginMutation } from '../../src/features/auth/auth.hooks';
import type { AuthFormErrors, LoginFormValues } from '../../src/features/auth/auth.types';
import { mapApiErrorToUi } from '../../src/lib/errors';
import { colors, spacing, textStyles } from '../../src/theme';

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
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const uiError = useMemo(
    () => (loginMutation.error ? mapApiErrorToUi(loginMutation.error) : null),
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

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>AMG Academy</Text>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>
          Access your events, tickets, courses, and AMG Academy profile.
        </Text>
      </View>

      <GlassCard style={styles.card}>
        <TextField
          label="Email"
          value={values.email}
          onChangeText={(email) => setValues((current) => ({ ...current, email }))}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          error={errors.email}
        />
        <TextField
          label="Password"
          value={values.password}
          onChangeText={(password) => setValues((current) => ({ ...current, password }))}
          secureTextEntry={!showPassword}
          textContentType="password"
          error={errors.password}
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
        <Button
          label="Create account"
          variant="ghost"
          onPress={() => router.push('/(auth)/register' as never)}
        />
        <Button
          label="Forgot password"
          variant="ghost"
          onPress={() => router.push('/(auth)/forgot-password' as never)}
        />
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
  hero: {
    gap: spacing.xs,
  },
  eyebrow: {
    ...textStyles.caption,
    color: colors.accent.primary,
    textTransform: 'uppercase',
  },
  title: textStyles.title,
  subtitle: textStyles.body,
  card: {
    gap: spacing.md,
  },
});
