import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, radius, spacing, textStyles } from '../../theme';

export interface QRCodePanelProps {
  payload: string | null;
  fallbackCode?: string;
}

export function QRCodePanel({ payload, fallbackCode }: QRCodePanelProps) {
  if (!payload) {
    return (
      <View accessibilityRole="text" style={styles.lockedPanel}>
        <Text style={styles.lockedTitle}>QR unavailable</Text>
        <Text style={styles.lockedMessage}>The backend has not issued a usable QR payload.</Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <View accessibilityLabel="Event QR code" style={styles.qrFrame}>
        <QRCode
          value={payload}
          size={176}
          color={colors.text.inverse}
          backgroundColor={colors.text.primary}
        />
      </View>
      {fallbackCode ? (
        <View style={styles.fallback}>
          <Text style={styles.fallbackLabel}>Fallback code</Text>
          <Text selectable style={styles.fallbackCode}>
            {fallbackCode}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    gap: spacing.md,
  },
  qrFrame: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.text.primary,
    padding: spacing.md,
  },
  fallback: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  fallbackLabel: textStyles.caption,
  fallbackCode: {
    ...textStyles.heading,
    color: colors.accent.primary,
    letterSpacing: 0,
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
