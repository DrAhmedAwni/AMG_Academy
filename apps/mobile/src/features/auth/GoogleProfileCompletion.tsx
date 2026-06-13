import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, TextField } from '../../components/ui';
import { ErrorState } from '../../components/states/ErrorState';
import { PhoneField } from '../../components/forms/PhoneField';
import type {
  AuthFormErrors,
  GoogleProfileCompletionValues,
  GoogleProfileSeed,
} from './auth.types';
import type { UiErrorState } from '../../lib/errors';
import { colors, spacing, textStyles } from '../../theme';

const requiredFields: Array<keyof Pick<
  GoogleProfileCompletionValues,
  'name' | 'phone' | 'specialty' | 'clinic' | 'city'
>> = ['name', 'phone', 'specialty', 'clinic', 'city'];

const requiredMessages: Record<(typeof requiredFields)[number], string> = {
  name: 'Enter your full name.',
  phone: 'Enter a phone number for AMG event updates.',
  specialty: 'Enter your dental specialty.',
  clinic: 'Enter your clinic, hospital, or institution.',
  city: 'Enter your city.',
};

function cleanProfileText(value: string | null | undefined) {
  return value && value !== 'null' ? value : '';
}

function cleanOptionalProfileText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function GoogleProfileCompletion({
  idToken,
  profile,
  loading,
  error,
  onSubmit,
  onCancel,
}: {
  idToken: string;
  profile: GoogleProfileSeed;
  loading?: boolean;
  error?: UiErrorState | null;
  onSubmit: (values: GoogleProfileCompletionValues) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Omit<GoogleProfileCompletionValues, 'idToken'>>({
    name: cleanProfileText(profile.name),
    phone: cleanProfileText(profile.phone),
    specialty: cleanProfileText(profile.specialty),
    clinic: cleanProfileText(profile.clinic),
    city: cleanProfileText(profile.city),
    professionalTitle: cleanProfileText(profile.professionalTitle),
    practiceType: cleanProfileText(profile.practiceType),
    yearsOfExperience: profile.yearsOfExperience,
  });
  const [yearsText, setYearsText] = useState(
    profile.yearsOfExperience === undefined || profile.yearsOfExperience === null
      ? ''
      : String(profile.yearsOfExperience),
  );
  const [errors, setErrors] = useState<AuthFormErrors>({});

  const updateField = (field: keyof Omit<GoogleProfileCompletionValues, 'idToken'>, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async () => {
    const nextErrors = requiredFields.reduce<AuthFormErrors>((fieldErrors, field) => {
      if (!String(values[field] ?? '').trim()) {
        fieldErrors[field] = requiredMessages[field];
      }
      return fieldErrors;
    }, {});

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const parsedYears = yearsText.trim() ? Number(yearsText.trim()) : undefined;
    if (parsedYears !== undefined && (!Number.isInteger(parsedYears) || parsedYears < 0 || parsedYears > 80)) {
      setErrors({ yearsOfExperience: 'Enter a number from 0 to 80' });
      return;
    }

    await onSubmit({
      name: values.name.trim(),
      specialty: values.specialty.trim(),
      clinic: values.clinic.trim(),
      city: values.city.trim(),
      professionalTitle: cleanOptionalProfileText(values.professionalTitle ?? ''),
      practiceType: cleanOptionalProfileText(values.practiceType ?? ''),
      idToken,
      phone: values.phone.trim(),
      yearsOfExperience: parsedYears,
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Verified with Google</Text>
        <Text style={styles.noticeText}>
          {profile.email}
        </Text>
        <Text style={styles.noticeHint}>
          Complete the required professional details so AMG can prepare event, course, and certificate records correctly.
        </Text>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Required profile</Text>
          <Text style={styles.sectionHint}>Used for registrations, tickets, and certificates.</Text>
        </View>
        <TextField
          label="Full name"
          value={values.name}
          onChangeText={(name) => updateField('name', name)}
          error={errors.name}
          required
        />
        <PhoneField
          value={values.phone}
          onChangeText={(phone) => updateField('phone', phone)}
          error={errors.phone}
          required
        />
        <TextField
          label="Specialty"
          value={values.specialty}
          onChangeText={(specialty) => updateField('specialty', specialty)}
          error={errors.specialty}
          required
        />
        <TextField
          label="Clinic"
          value={values.clinic}
          onChangeText={(clinic) => updateField('clinic', clinic)}
          error={errors.clinic}
          required
        />
        <TextField
          label="City"
          value={values.city}
          onChangeText={(city) => updateField('city', city)}
          error={errors.city}
          required
        />
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Optional practice details</Text>
          <Text style={styles.sectionHint}>Add these now if you want AMG records to be more complete.</Text>
        </View>
        <TextField
          label="Professional title"
          value={values.professionalTitle}
          onChangeText={(professionalTitle) => updateField('professionalTitle', professionalTitle)}
          placeholder="Consultant, Resident, GP dentist"
        />
        <TextField
          label="Practice type"
          value={values.practiceType}
          onChangeText={(practiceType) => updateField('practiceType', practiceType)}
          placeholder="Private clinic, hospital, university"
        />
        <TextField
          label="Years of experience"
          value={yearsText}
          onChangeText={(nextValue) => {
            setYearsText(nextValue);
            setErrors((current) => ({ ...current, yearsOfExperience: undefined }));
          }}
          keyboardType="number-pad"
          placeholder="5"
          error={errors.yearsOfExperience}
        />
      </View>
      {error ? <ErrorState title={error.title} message={error.message} /> : null}
      <Button
        label="Complete profile"
        loading={loading}
        onPress={() => {
          void submit();
        }}
      />
      <Button label="Back" variant="ghost" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  notice: {
    borderWidth: 1,
    borderColor: colors.accent.primary + '55',
    backgroundColor: colors.accent.primary + '16',
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  noticeTitle: {
    ...textStyles.label,
    color: colors.accent.primary,
  },
  noticeText: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  noticeHint: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  section: {
    gap: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.md,
  },
  sectionHeader: {
    gap: spacing.xxs,
  },
  sectionTitle: {
    ...textStyles.label,
  },
  sectionHint: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
});
