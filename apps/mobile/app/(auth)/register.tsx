import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { registerSchema } from '@amg/shared';
import { Screen } from '../../src/components/layout/Screen';
import { Button, GlassCard, TextField } from '../../src/components/ui';
import { ErrorState } from '../../src/components/states/ErrorState';
import { SuccessState } from '../../src/components/states/SuccessState';
import { useRegisterMutation } from '../../src/features/auth/auth.hooks';
import type { AuthFormErrors, RegisterFormValues } from '../../src/features/auth/auth.types';
import { mapApiErrorToUi } from '../../src/lib/errors';
import { colors, spacing, textStyles } from '../../src/theme';

function getRegisterErrors(values: RegisterFormValues): AuthFormErrors {
  const result = registerSchema.safeParse(values);
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

export default function RegisterScreen() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [values, setValues] = useState<RegisterFormValues>({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
    clinic: '',
    city: '',
  });
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const uiError = useMemo(
    () => (registerMutation.error ? mapApiErrorToUi(registerMutation.error) : null),
    [registerMutation.error],
  );

  const submit = async () => {
    const nextErrors = getRegisterErrors(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await registerMutation.mutateAsync(values);
  };

  if (registerMutation.isSuccess) {
    return (
      <Screen scroll={false}>
        <SuccessState
          title="Account created"
          message="Check your email verification status before signing in."
          action={{
            label: 'Go to sign in',
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          Register with your details. Account verification remains handled by AMG Academy.
        </Text>
      </View>

      <GlassCard style={styles.card}>
        <TextField
          label="Full name"
          value={values.name}
          onChangeText={(name) => setValues((current) => ({ ...current, name }))}
          textContentType="name"
          error={errors.name}
        />
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
          secureTextEntry
          textContentType="newPassword"
          error={errors.password}
          helperText="Use at least 8 characters with uppercase, lowercase, and a number."
        />
        <TextField
          label="Phone"
          value={values.phone}
          onChangeText={(phone) => setValues((current) => ({ ...current, phone }))}
          keyboardType="phone-pad"
          error={errors.phone}
        />
        <TextField
          label="Specialty"
          value={values.specialty}
          onChangeText={(specialty) => setValues((current) => ({ ...current, specialty }))}
          error={errors.specialty}
        />
        <TextField
          label="Clinic"
          value={values.clinic}
          onChangeText={(clinic) => setValues((current) => ({ ...current, clinic }))}
          error={errors.clinic}
        />
        <TextField
          label="City"
          value={values.city}
          onChangeText={(city) => setValues((current) => ({ ...current, city }))}
          error={errors.city}
        />
        {uiError ? <ErrorState title={uiError.title} message={uiError.message} /> : null}
        <Button
          label="Create account"
          loading={registerMutation.isPending}
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
