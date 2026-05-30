import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard, StatusBadge } from '../../components/ui';
import type { ScannerValidationResult } from './scanner.api';
import { colors, spacing, textStyles, typography } from '../../theme';

export interface ScannerResultCardProps {
  result: ScannerValidationResult;
}

function formatTime(value: string | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value));
}

export function ScannerResultCard({ result }: ScannerResultCardProps) {
  const checkInTime = formatTime(result.checkInTime);
  const previousCheckInTime = formatTime(result.previousCheckInTime);

  return (
    <GlassCard style={[styles.card, result.valid ? styles.successCard : styles.errorCard]}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.kicker}>{result.valid ? 'Accepted' : 'Rejected'}</Text>
          <Text style={styles.title}>{result.title}</Text>
        </View>
        <StatusBadge domain="scanner" status={result.reason} />
      </View>

      <Text style={styles.message}>{result.message}</Text>

      <View style={styles.details}>
        {result.attendeeName ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Attendee</Text>
            <Text style={styles.detailValue}>{result.attendeeName}</Text>
          </View>
        ) : null}
        {result.eventName ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Event</Text>
            <Text style={styles.detailValue}>{result.eventName}</Text>
          </View>
        ) : null}
        {result.paymentStatus ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment</Text>
            <StatusBadge domain="payment" status={result.paymentStatus} />
          </View>
        ) : null}
        {result.registrationStatus ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Registration</Text>
            <StatusBadge domain="registration" status={result.registrationStatus} />
          </View>
        ) : null}
        {result.attendanceStatus ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Attendance</Text>
            <StatusBadge domain="attendance" status={result.attendanceStatus} />
          </View>
        ) : null}
        {checkInTime ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Checked in</Text>
            <Text style={styles.detailValue}>{checkInTime}</Text>
          </View>
        ) : null}
        {previousCheckInTime ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Previous scan</Text>
            <Text style={styles.detailValue}>{previousCheckInTime}</Text>
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  successCard: {
    borderColor: 'rgba(34, 197, 94, 0.42)',
  },
  errorCard: {
    borderColor: 'rgba(239, 68, 68, 0.42)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xxs,
  },
  kicker: {
    ...textStyles.caption,
    color: colors.accent.primary,
    textTransform: 'uppercase',
  },
  title: {
    ...textStyles.heading,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
  },
  message: textStyles.body,
  details: {
    gap: spacing.sm,
  },
  detailRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: textStyles.caption,
  detailValue: {
    ...textStyles.label,
    flex: 1,
    textAlign: 'right',
  },
});
