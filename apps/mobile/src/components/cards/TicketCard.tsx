import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBadge, GlassCard } from '../ui';
import { QRCodePanel } from '../../features/tickets/QRCodePanel';
import {
  getTicketWalletState,
  type MobileTicket,
} from '../../features/tickets/tickets.api';
import { colors, radius, spacing, textStyles, typography } from '../../theme';

export interface TicketCardProps {
  ticket: MobileTicket;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function TicketCard({ ticket }: TicketCardProps) {
  const walletState = getTicketWalletState(ticket);

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.kicker}>{formatEventDate(ticket.event.startDate)}</Text>
          <Text style={styles.title}>{ticket.event.title}</Text>
        </View>
        <StatusBadge domain="qrTicket" status={ticket.status} label={walletState.label} />
      </View>

      <View style={styles.badges}>
        {ticket.registrationStatus ? (
          <StatusBadge domain="registration" status={ticket.registrationStatus} />
        ) : null}
        <StatusBadge domain="payment" status={ticket.paymentStatus} />
      </View>

      {walletState.canDisplayQr ? (
        <QRCodePanel payload={ticket.qrPayload} fallbackCode={ticket.fallbackCode} />
      ) : (
        <View style={styles.lockedPanel}>
          <Text style={styles.lockedTitle}>{walletState.label}</Text>
          <Text style={styles.lockedMessage}>{walletState.message}</Text>
          {ticket.fallbackCode ? (
            <Text style={styles.fallbackText}>Fallback code: {ticket.fallbackCode}</Text>
          ) : null}
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
  fallbackText: {
    ...textStyles.caption,
    color: colors.accent.primary,
  },
});
