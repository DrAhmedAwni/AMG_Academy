import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { forgotPasswordSchema } from '@amg/shared';
import { Screen } from '../../src/components/layout/Screen';
import { Button, GlassCard, TextField } from '../../src/components/ui';
import { ErrorState } from '../../src/components/states/ErrorState';
import { SuccessState } from '../../src/components/states/SuccessState';
import { useForgotPasswordMutation } from '../../src/features/auth/auth.hooks';
import type { AuthFormErrors, ForgotPasswordFormValues } from '../../src/features/auth/auth.types';
import { mapApiErrorToUi } from '../../src/lib/errors';
import { colors, spacing, textStyles } from '../../src/theme';

function getForgotPasswordErrors(values: ForgotPasswordFormValues): AuthFormErrors {
  const result = forgotPasswordSchema.safeParse(values);
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [values, setValues] = useState<ForgotPasswordFormValues>({ email: '' });
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const uiError = useMemo(
    () => (forgotPasswordMutation.error ? mapApiErrorToUi(forgotPasswordMutation.error) : null),
    [forgotPasswordMutation.error],
  );

  const submit = async () => {
    const nextErrors = getForgotPasswordErrors(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await forgotPasswordMutation.mutateAsync(values);
  };

  const updateEmail = (email: string) => {
    if (forgotPasswordMutation.error) {
      forgotPasswordMutation.reset();
    }
    setValues({ email });
    setErrors((current) => ({ ...current, email: undefined }));
  };

  if (forgotPasswordMutation.isSuccess) {
    return (
      <Screen scroll={false}>
        <SuccessState
          title="Check your email"
          message="If the email exists, AMG Academy sent a reset link."
          action={{
            label: 'Back to sign in',
            onPress: () => router.replace('/(auth)/login' as never),
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>AMG Academy</Text>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>Enter the email connected to your AMG Academy account. If it matches, we will send a reset link.</Text>
      </View>

      <GlassCard style={styles.card}>
        <TextField
          label="Email"
          value={values.email}
          onChangeText={updateEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          error={errors.email}
          required
        />
        {uiError ? <ErrorState title={uiError.title} message={uiError.message} /> : null}
        <Button
          label="Send reset link"
          loading={forgotPasswordMutation.isPending}
          onPress={() => {
            void submit();
          }}
        />
        <Button
          label="Back to sign in"
          variant="ghost"
          onPress={() => router.replace('/(auth)/login' as never)}
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
