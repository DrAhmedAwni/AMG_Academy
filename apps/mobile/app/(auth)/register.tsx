import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { registerSchema } from '@amg/shared';
import { Screen } from '../../src/components/layout/Screen';
import { Button, GlassCard, PasswordToggle, TextField } from '../../src/components/ui';
import { ErrorState } from '../../src/components/states/ErrorState';
import { SuccessState } from '../../src/components/states/SuccessState';
import { useRegisterMutation } from '../../src/features/auth/auth.hooks';
import type { AuthFormErrors, RegisterFormValues } from '../../src/features/auth/auth.types';
import { useGoogleAuth } from '../../src/features/auth/googleAuth';
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
  const googleAuth = useGoogleAuth();
  const [values, setValues] = useState<RegisterFormValues>({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
    clinic: '',
    city: '',
    professionalTitle: '',
    practiceType: '',
  });
  const [yearsText, setYearsText] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const uiError = useMemo(
    () => (registerMutation.error
      ? mapApiErrorToUi(registerMutation.error)
      : null),
    [registerMutation.error],
  );

  const submit = async () => {
    const payload: RegisterFormValues = {
      ...values,
      yearsOfExperience: yearsText.trim() ? Number(yearsText.trim()) : undefined,
    };
    const nextErrors = getRegisterErrors(payload);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await registerMutation.mutateAsync(payload);
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
        <Image source={require('../../assets/logo-horizontal.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          Join AMG Academy with your professional profile.
        </Text>
      </View>

      <GlassCard style={styles.card}>
        <Button
          label="Continue with Google"
          variant="secondary"
          loading={googleAuth.loading}
          disabled={!googleAuth.requestReady}
          onPress={() => {
            void googleAuth.start();
          }}
        />
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or complete your details</Text>
          <View style={styles.divider} />
        </View>
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
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          error={errors.password}
          helperText="Use at least 8 characters with uppercase, lowercase, and a number."
          rightAction={
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
            />
          }
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
          label="Professional title"
          value={values.professionalTitle}
          onChangeText={(professionalTitle) => setValues((current) => ({ ...current, professionalTitle }))}
          placeholder="e.g., Consultant, Resident, GP dentist"
          error={errors.professionalTitle}
        />
        <TextField
          label="Practice type"
          value={values.practiceType}
          onChangeText={(practiceType) => setValues((current) => ({ ...current, practiceType }))}
          placeholder="e.g., Private clinic, hospital, university"
          error={errors.practiceType}
        />
        <TextField
          label="Years of experience"
          value={yearsText}
          onChangeText={setYearsText}
          keyboardType="number-pad"
          placeholder="e.g., 5"
          error={errors.yearsOfExperience}
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
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 220,
    height: 56,
  },
  title: textStyles.title,
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
});
