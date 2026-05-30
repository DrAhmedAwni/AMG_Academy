import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, type ButtonProps } from '../ui/Button';
import { colors, spacing, textStyles } from '../../theme';

export interface PermissionDeniedStateProps {
  title?: string;
  message?: string;
  action?: Pick<ButtonProps, 'label' | 'onPress' | 'accessibilityLabel'>;
}

export function PermissionDeniedState({
  title = 'Permission required',
  message = 'Your account does not have access to this AMG Academy area.',
  action,
}: PermissionDeniedStateProps) {
  return (
    <View accessibilityRole="alert" style={styles.container}>
      <Text style={styles.kicker}>Restricted</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action ? <Button variant="secondary" {...action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  kicker: {
    ...textStyles.caption,
    color: colors.status.warning,
  },
  title: {
    ...textStyles.heading,
    textAlign: 'center',
  },
  message: {
    ...textStyles.body,
    textAlign: 'center',
  },
});
