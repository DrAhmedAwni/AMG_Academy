import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { countryDialCodes, type CountryDialCode } from '@amg/shared';
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

const defaultCountry = countryDialCodes[0] ?? { country: 'Egypt', code: '+20', flag: 'EG' };

function findCountryForPhone(phone?: string) {
  const trimmed = phone?.trim() ?? '';
  if (!trimmed.startsWith('+')) {
    return defaultCountry;
  }

  return [...countryDialCodes]
    .sort((a, b) => b.code.length - a.code.length)
    .find((country) => trimmed.startsWith(country.code)) ?? defaultCountry;
}

function stripDialCode(phone: string | undefined, country: CountryDialCode) {
  const trimmed = phone?.trim() ?? '';
  if (!trimmed.startsWith(country.code)) {
    return trimmed;
  }

  return trimmed.slice(country.code.length);
}

function formatPhone(country: CountryDialCode, phone: string) {
  const trimmedPhone = phone.trim();
  if (!trimmedPhone || trimmedPhone.startsWith('+')) {
    return trimmedPhone;
  }

  return `${country.code}${trimmedPhone.replace(/^0+/, '')}`;
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
  const initialCountry = findCountryForPhone(profile.phone);
  const [country, setCountry] = useState<CountryDialCode>(initialCountry);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [values, setValues] = useState<Omit<GoogleProfileCompletionValues, 'idToken'>>({
    name: profile.name ?? '',
    phone: stripDialCode(profile.phone, initialCountry),
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
      phone: formatPhone(country, values.phone),
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
      <View style={styles.phoneGroup}>
        <Text style={styles.phoneLabel}>Phone</Text>
        <View style={styles.phoneRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select country code"
            onPress={() => setCountryPickerOpen(true)}
            style={styles.countryButton}
          >
            <Text style={styles.countryFlag}>{country.flag}</Text>
            <Text style={styles.countryCode}>{country.code}</Text>
          </Pressable>
          <View style={styles.phoneInput}>
            <TextField
              label="Phone number"
              accessibilityLabel="Phone number"
              value={values.phone}
              onChangeText={(phone) => updateField('phone', phone)}
              keyboardType="phone-pad"
              error={errors.phone}
            />
          </View>
        </View>
      </View>
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

      <Modal
        visible={countryPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setCountryPickerOpen(false)}
      >
        <View style={styles.countryModalBackdrop}>
          <View style={styles.countryModal}>
            <View style={styles.countryModalHeader}>
              <Text style={styles.countryModalTitle}>Country code</Text>
              <Button label="Close" variant="ghost" size="sm" onPress={() => setCountryPickerOpen(false)} />
            </View>
            <ScrollView contentContainerStyle={styles.countryList}>
              {countryDialCodes.map((option) => (
                <Pressable
                  key={`${option.country}-${option.code}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.country} ${option.code}`}
                  onPress={() => {
                    setCountry(option);
                    setCountryPickerOpen(false);
                  }}
                  style={[
                    styles.countryOption,
                    option.country === country.country && option.code === country.code
                      ? styles.countryOptionSelected
                      : null,
                  ]}
                >
                  <Text style={styles.countryFlag}>{option.flag}</Text>
                  <Text style={styles.countryOptionText}>{option.country}</Text>
                  <Text style={styles.countryOptionCode}>{option.code}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  phoneGroup: {
    gap: spacing.xs,
  },
  phoneLabel: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  countryButton: {
    minHeight: 54,
    minWidth: 112,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    paddingHorizontal: spacing.sm,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  phoneInput: {
    flex: 1,
  },
  countryModalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
  },
  countryModal: {
    maxHeight: '78%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.raised,
    padding: spacing.md,
  },
  countryModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  countryModalTitle: {
    ...textStyles.heading,
    color: colors.text.primary,
  },
  countryList: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  countryOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
  },
  countryOptionSelected: {
    backgroundColor: colors.accent.primary + '22',
  },
  countryOptionText: {
    ...textStyles.body,
    flex: 1,
    color: colors.text.primary,
  },
  countryOptionCode: {
    ...textStyles.label,
    color: colors.text.secondary,
  },
});
