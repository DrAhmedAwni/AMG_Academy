import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { countryDialCodes, type CountryDialCode } from '@amg/shared';
import { Button, TextField } from '../ui';
import { colors, radius, spacing, textStyles } from '../../theme';

export interface PhoneFieldProps {
  label?: string;
  value: string;
  error?: string;
  required?: boolean;
  onChangeText: (value: string) => void;
}

const defaultCountry = countryDialCodes[0] ?? { country: 'Egypt', code: '+20', flag: 'EG' };

function findCountryForPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed.startsWith('+')) {
    return defaultCountry;
  }

  return [...countryDialCodes]
    .sort((a, b) => b.code.length - a.code.length)
    .find((country) => trimmed.startsWith(country.code)) ?? defaultCountry;
}

function stripDialCode(phone: string, country: CountryDialCode) {
  const trimmed = phone.trim();
  if (!trimmed.startsWith(country.code)) {
    return trimmed;
  }

  return trimmed.slice(country.code.length).trimStart();
}

function formatPhone(country: CountryDialCode, phone: string) {
  const trimmedPhone = phone.trim();
  if (!trimmedPhone || trimmedPhone.startsWith('+')) {
    return trimmedPhone;
  }

  return `${country.code}${trimmedPhone.replace(/^0+/, '')}`;
}

export function PhoneField({
  label = 'Phone',
  value,
  error,
  required,
  onChangeText,
}: PhoneFieldProps) {
  const [country, setCountry] = useState<CountryDialCode>(() => findCountryForPhone(value));
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const localPhone = stripDialCode(value, country);

  const updateCountry = (nextCountry: CountryDialCode) => {
    setCountry(nextCountry);
    setCountryPickerOpen(false);
    onChangeText(formatPhone(nextCountry, localPhone));
  };

  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select country code"
          onPress={() => setCountryPickerOpen(true)}
          style={styles.countryButton}
        >
          <Text style={styles.countryFlag}>{country.flag}</Text>
          <Text style={styles.countryCode}>{country.code}</Text>
        </Pressable>
        <View style={styles.inputCell}>
          <TextField
            label="Phone number"
            labelVisible={false}
            accessibilityLabel="Phone number"
            value={localPhone}
            onChangeText={(phone) => onChangeText(formatPhone(country, phone))}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            error={error}
          />
        </View>
      </View>

      <Modal
        visible={countryPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setCountryPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Country code</Text>
              <Button label="Close" variant="ghost" size="sm" onPress={() => setCountryPickerOpen(false)} />
            </View>
            <ScrollView contentContainerStyle={styles.countryList}>
              {countryDialCodes.map((option) => (
                <Pressable
                  key={`${option.country}-${option.code}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.country} ${option.code}`}
                  onPress={() => updateCountry(option)}
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
  group: {
    gap: spacing.xs,
  },
  groupLabel: {
    ...textStyles.label,
  },
  required: {
    color: colors.status.error,
  },
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  countryButton: {
    width: 128,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
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
  },
  inputCell: {
    flex: 1,
    minWidth: 0,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.background.overlay,
  },
  modal: {
    maxHeight: '78%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.raised,
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalTitle: {
    ...textStyles.heading,
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
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  countryOptionSelected: {
    backgroundColor: colors.interactive.pressed,
  },
  countryOptionText: {
    ...textStyles.body,
    flex: 1,
  },
  countryOptionCode: {
    ...textStyles.label,
    color: colors.text.secondary,
  },
});
