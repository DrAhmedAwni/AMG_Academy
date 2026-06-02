import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, radius, spacing, textStyles } from '../../theme';

export interface QRCodePanelProps {
  value: string | null;
}

export function QRCodePanel({ value }: QRCodePanelProps) {
  if (!value) {
    return (
      <View accessibilityRole="text" style={styles.lockedPanel}>
        <Text style={styles.lockedTitle}>QR unavailable</Text>
        <Text style={styles.lockedMessage}>Your QR code is not ready yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <View accessibilityLabel="Event QR code" style={styles.qrFrame}>
        <QRCode
          value={value}
          size={190}
          color={colors.text.inverse}
          backgroundColor={colors.text.primary}
        />
      </View>
      <Text style={styles.helperText}>Show this QR at event check-in.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  qrFrame: {
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 8,
    borderColor: colors.surface.raised,
    backgroundColor: colors.text.primary,
    padding: spacing.lg,
  },
  helperText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  lockedPanel: {
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.elevated,
    padding: spacing.md,
  },
  lockedTitle: textStyles.label,
  lockedMessage: {
    ...textStyles.body,
    textAlign: 'center',
  },
});
