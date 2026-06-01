import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, textStyles } from '../../theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: textStyles.heading,
  subtitle: textStyles.body,
  action: {
    flexShrink: 0,
  },
});
