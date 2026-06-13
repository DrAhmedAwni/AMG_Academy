import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, textStyles, typography } from '../../theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark} />
          <Text style={styles.eyebrow}>AMG Academy</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandMark: {
    width: 22,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.gold,
  },
  eyebrow: {
    ...textStyles.caption,
    color: colors.accent.gold,
    fontWeight: typography.weight.bold,
    textTransform: 'uppercase',
  },
  title: {
    ...textStyles.title,
    letterSpacing: 0,
  },
  subtitle: {
    ...textStyles.body,
    maxWidth: 520,
    color: colors.text.secondary,
  },
  action: {
    flexShrink: 0,
    paddingTop: spacing.lg,
  },
});
