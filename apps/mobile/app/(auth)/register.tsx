import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { registerSchema } from '@amg/shared';
import { Screen } from '../../src/components/layout/Screen';
import { Button, GlassCard, PasswordToggle, TextField } from '../../src/components/ui';
import { ErrorState } from '../../src/components/states/ErrorState';
import { SuccessState } from '../../src/components/states/SuccessState';
import { PhoneField } from '../../src/components/forms/PhoneField';
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
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      phone: values.phone?.trim() || undefined,
      specialty: values.specialty?.trim() || undefined,
      clinic: values.clinic?.trim() || undefined,
      city: values.city?.trim() || undefined,
      professionalTitle: values.professionalTitle?.trim() || undefined,
      practiceType: values.practiceType?.trim() || undefined,
      yearsOfExperience: yearsText.trim() ? Number(yearsText.trim()) : undefined,
    };
    const nextErrors = getRegisterErrors(payload);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await registerMutation.mutateAsync(payload);
  };

  const updateField = (field: keyof RegisterFormValues, value: string) => {
    if (registerMutation.error) {
      registerMutation.reset();
    }
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  if (registerMutation.isSuccess) {
    return (
      <Screen scroll={false}>
        <SuccessState
          title="Account created"
          message={registerMutation.data?.message ?? 'A verification link has been sent to your email.'}
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
        <Image
          source={require('../../assets/logo-horizontal.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="AMG Academy"
        />
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          Start with your sign-in details. Professional information can help AMG prepare event and course records.
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
          <Text style={styles.dividerText}>or complete your details</Text>
          <View style={styles.divider} />
        </View>
        <TextField
          label="Full name"
          value={values.name}
          onChangeText={(name) => updateField('name', name)}
          textContentType="name"
          error={errors.name}
          required
        />
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
          textContentType="newPassword"
          error={errors.password}
          helperText="Use at least 8 characters with uppercase, lowercase, and a number."
          required
          rightAction={
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
            />
          }
        />
        <PhoneField
          value={values.phone ?? ''}
          onChangeText={(phone) => updateField('phone', phone)}
          error={errors.phone}
        />
        <View style={styles.optionalSection}>
          <Text style={styles.sectionTitle}>Professional details</Text>
          <Text style={styles.sectionHint}>Optional now. Add them when you want AMG event and course records to be more complete.</Text>
        </View>
        <TextField
          label="Specialty"
          value={values.specialty}
          onChangeText={(specialty) => updateField('specialty', specialty)}
          error={errors.specialty}
        />
        <TextField
          label="Professional title"
          value={values.professionalTitle}
          onChangeText={(professionalTitle) => updateField('professionalTitle', professionalTitle)}
          placeholder="e.g., Consultant, Resident, GP dentist"
          error={errors.professionalTitle}
        />
        <TextField
          label="Practice type"
          value={values.practiceType}
          onChangeText={(practiceType) => updateField('practiceType', practiceType)}
          placeholder="e.g., Private clinic, hospital, university"
          error={errors.practiceType}
        />
        <TextField
          label="Years of experience"
          value={yearsText}
          onChangeText={(nextValue) => {
            setYearsText(nextValue);
            setErrors((current) => ({ ...current, yearsOfExperience: undefined }));
          }}
          keyboardType="number-pad"
          placeholder="e.g., 5"
          error={errors.yearsOfExperience}
        />
        <TextField
          label="Clinic"
          value={values.clinic}
          onChangeText={(clinic) => updateField('clinic', clinic)}
          error={errors.clinic}
        />
        <TextField
          label="City"
          value={values.city}
          onChangeText={(city) => updateField('city', city)}
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
  optionalSection: {
    gap: spacing.xxs,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.md,
  },
  sectionTitle: {
    ...textStyles.label,
  },
  sectionHint: {
    ...textStyles.caption,
    color: colors.text.secondary,
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
