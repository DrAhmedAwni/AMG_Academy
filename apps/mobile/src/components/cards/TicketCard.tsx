import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const isActive = walletState.canDisplayQr;

  return (
    <GlassCard style={[styles.card, isActive ? styles.activeCard : styles.inactiveCard]}>
      <View style={styles.ticketTop}>
        <View style={[styles.ticketIcon, isActive ? styles.activeIcon : styles.inactiveIcon]}>
          <Ionicons
            name={isActive ? 'qr-code' : 'lock-closed-outline'}
            size={22}
            color={isActive ? colors.text.inverse : colors.text.muted}
          />
        </View>
        <View style={styles.titleGroup}>
          <Text style={styles.kicker}>{formatEventDate(ticket.event.startDate)}</Text>
          <Text style={styles.title}>{ticket.event.title}</Text>
        </View>
        <StatusBadge domain="qrTicket" status={ticket.status} label={walletState.label} />
      </View>

      <View style={styles.divider} />

      {walletState.canDisplayQr ? (
        <QRCodePanel value={ticket.qrPayload} />
      ) : (
        <View style={styles.lockedPanel}>
          <Text style={styles.lockedTitle}>{walletState.label}</Text>
          <Text style={styles.lockedMessage}>{walletState.message}</Text>
        </View>
      )}

      <View style={styles.badges}>
        {ticket.registrationStatus ? (
          <StatusBadge domain="registration" status={ticket.registrationStatus} />
        ) : null}
        <StatusBadge domain="payment" status={ticket.paymentStatus} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
    borderStyle: 'solid',
  },
  activeCard: {
    borderColor: 'rgba(94, 234, 212, 0.42)',
    backgroundColor: 'rgba(16, 40, 52, 0.92)',
  },
  inactiveCard: {
    opacity: 0.78,
  },
  ticketTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  ticketIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  activeIcon: {
    backgroundColor: colors.accent.primary,
  },
  inactiveIcon: {
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.elevated,
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
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
  },
  lockedPanel: {
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.soft,
    padding: spacing.lg,
  },
  lockedTitle: textStyles.label,
  lockedMessage: {
    ...textStyles.body,
    textAlign: 'center',
  },
});
