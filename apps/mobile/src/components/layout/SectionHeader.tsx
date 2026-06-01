import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, type ButtonProps } from '../ui/Button';
import { spacing, textStyles } from '../../theme';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: Pick<ButtonProps, 'label' | 'onPress' | 'accessibilityLabel'>;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
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
  title: textStyles.label,
  subtitle: textStyles.caption,
});
