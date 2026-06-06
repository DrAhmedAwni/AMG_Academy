import React, { type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  rightAction?: ReactNode;
}

export function TextField({ label, error, helperText, rightAction, style, onPress, ...inputProps }: TextFieldProps) {
  const describedBy = error ? `${label}-error` : helperText ? `${label}-helper` : undefined;
  const pressableInput = inputProps.editable === false && typeof onPress === 'function';

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          accessibilityHint={describedBy}
          placeholderTextColor={colors.text.muted}
          style={[
            styles.input,
            error ? styles.inputError : null,
            rightAction ? styles.inputWithAction : null,
            style,
          ]}
        />
        {pressableInput ? (
          <Pressable
            accessibilityLabel={inputProps.accessibilityLabel ?? label}
            onPress={onPress}
            style={styles.inputPressOverlay}
          />
        ) : null}
        {rightAction ? (
          <View style={styles.rightAction}>{rightAction}</View>
        ) : null}
      </View>
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

export function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} accessibilityLabel={visible ? 'Hide password' : 'Show password'} hitSlop={8}>
      <Ionicons name={visible ? 'eye-off' : 'eye'} size={22} color={colors.text.muted} />
    </Pressable>
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
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputPressOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.lg,
  },
  input: {
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: typography.size.md,
  },
  inputWithAction: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  rightAction: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
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
