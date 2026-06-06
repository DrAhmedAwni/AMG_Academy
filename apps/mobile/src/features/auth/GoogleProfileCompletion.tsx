import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, TextField } from '../../components/ui';
import { ErrorState } from '../../components/states/ErrorState';
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
    name: profile.name ?? '',
    phone: profile.phone ?? '',
    specialty: profile.specialty ?? '',
    clinic: profile.clinic ?? '',
    city: profile.city ?? '',
    professionalTitle: profile.professionalTitle ?? '',
    practiceType: profile.practiceType ?? '',
    yearsOfExperience: profile.yearsOfExperience,
  });
  const [yearsText, setYearsText] = useState(
    profile.yearsOfExperience === undefined ? '' : String(profile.yearsOfExperience),
  );
  const [errors, setErrors] = useState<AuthFormErrors>({});

  const updateField = (field: keyof Omit<GoogleProfileCompletionValues, 'idToken'>, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async () => {
    const nextErrors = requiredFields.reduce<AuthFormErrors>((fieldErrors, field) => {
      if (!String(values[field] ?? '').trim()) {
        fieldErrors[field] = 'Required';
      }
      return fieldErrors;
    }, {});

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      ...values,
      idToken,
      yearsOfExperience: yearsText.trim() ? Number(yearsText.trim()) : undefined,
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Google verified {profile.email}. Complete your AMG Academy profile to continue.
        </Text>
      </View>
      <TextField
        label="Full name"
        value={values.name}
        onChangeText={(name) => updateField('name', name)}
        error={errors.name}
      />
      <TextField
        label="Phone"
        value={values.phone}
        onChangeText={(phone) => updateField('phone', phone)}
        keyboardType="phone-pad"
        error={errors.phone}
      />
      <TextField
        label="Specialty"
        value={values.specialty}
        onChangeText={(specialty) => updateField('specialty', specialty)}
        error={errors.specialty}
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
        onChangeText={setYearsText}
        keyboardType="number-pad"
        placeholder="5"
      />
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
  },
  noticeText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
});
