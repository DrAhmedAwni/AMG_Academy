import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

export function TextField({ label, error, helperText, style, ...inputProps }: TextFieldProps) {
  const describedBy = error ? `${label}-error` : helperText ? `${label}-helper` : undefined;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={inputProps.accessibilityLabel ?? label}
        accessibilityHint={describedBy}
        placeholderTextColor={colors.text.muted}
        style={[styles.input, error ? styles.inputError : null, style]}
      />
      {error ? (
        <Text nativeID={`${label}-error`} style={styles.error}>
          {error}
        </Text>
      ) : helperText ? (
        <Text nativeID={`${label}-helper`} style={styles.helper}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.elevated,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.size.md,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  helper: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
  },
  error: {
    color: colors.status.error,
    fontSize: typography.size.xs,
  },
});
