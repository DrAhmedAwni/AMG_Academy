import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, type ButtonProps } from '../ui/Button';
import { colors, radius, spacing, textStyles, typography } from '../../theme';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: Pick<ButtonProps, 'label' | 'onPress' | 'accessibilityLabel'>;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <View style={styles.marker} />
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <Button variant="ghost" {...action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  marker: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.gold,
  },
  title: {
    ...textStyles.label,
    color: colors.text.primary,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
  },
  subtitle: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
});
