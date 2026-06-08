import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PaymentStatus, QRTicketStatus } from '@amg/shared';
import { Button, GlassCard, StatusBadge } from '../../components/ui';
import { ZoomableImage } from '../../components/media';
import { colors, radius, spacing, textStyles, typography } from '../../theme';
import {
  getEventActionState,
  type EventActionState,
  type MobileEvent,
} from './events.api';

export interface EventDetailContentProps {
  event: MobileEvent;
  registering?: boolean;
  onRegister: () => void;
  onContinuePayment?: (paymentId: string) => void;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function resolvePrimaryAction(
  action: EventActionState,
  onRegister: () => void,
  onContinuePayment?: (paymentId: string) => void,
) {
  if (action.kind === 'continue_payment' && action.paymentId && onContinuePayment) {
    const paymentId = action.paymentId;
    return () => onContinuePayment(paymentId);
  }

  return onRegister;
}

export function EventDetailContent({
  event,
  registering = false,
  onRegister,
  onContinuePayment,
}: EventDetailContentProps) {
  const action = getEventActionState(event);
  const primaryAction = resolvePrimaryAction(action, onRegister, onContinuePayment);

  return (
    <View style={styles.container}>
      {event.thumbnailUrl ? (
        <ZoomableImage uri={event.thumbnailUrl} title={event.title} resizeMode="contain" style={styles.hero} />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroPlaceholderText}>{event.title.slice(0, 1).toUpperCase()}</Text>
        </View>
      )}

      <GlassCard style={styles.summaryCard}>
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.kicker}>{event.category.name}</Text>
            <Text style={styles.title}>{event.title}</Text>
          </View>
          <Text numberOfLines={2} style={styles.price}>
            {event.isFree ? 'Free' : `${event.price.toLocaleString()} ${event.currency}`}
          </Text>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Starts</Text>
            <Text style={styles.detailValue}>{formatDateTime(event.startDate)}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Ends</Text>
            <Text style={styles.detailValue}>{formatDateTime(event.endDate)}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{event.location}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Seats</Text>
            <Text style={styles.detailValue}>{event.remainingSpots} available</Text>
          </View>
        </View>

        <View style={styles.badges}>
          {event.registrationStatus ? (
            <StatusBadge domain="registration" status={event.registrationStatus} />
          ) : null}
          {event.paymentStatus ? (
            <StatusBadge domain="payment" status={event.paymentStatus} />
          ) : (
            <StatusBadge
              domain="payment"
              status={event.isFree ? PaymentStatus.NotRequired : PaymentStatus.Pending}
            />
          )}
          {event.qrTicketStatus ? (
            <StatusBadge domain="qrTicket" status={event.qrTicketStatus} />
          ) : event.registrationStatus ? (
            <StatusBadge domain="qrTicket" status={QRTicketStatus.NotIssued} />
          ) : null}
        </View>
      </GlassCard>

      <GlassCard style={styles.actionCard}>
        <Text style={styles.actionTitle}>{action.label}</Text>
        <Text style={styles.actionHelper}>{action.helper}</Text>
        <Button
          label={action.label}
          variant={action.disabled ? 'secondary' : 'primary'}
          disabled={action.disabled}
          loading={registering}
          onPress={primaryAction}
        />
      </GlassCard>

      <View style={styles.descriptionBlock}>
        <Text style={styles.sectionTitle}>About this event</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  hero: {
    width: '100%',
    height: 204,
    borderRadius: radius.lg,
    backgroundColor: colors.surface.elevated,
  },
  heroPlaceholder: {
    width: '100%',
    height: 204,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.elevated,
  },
  heroPlaceholderText: {
    color: colors.accent.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  summaryCard: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  kicker: {
    ...textStyles.caption,
    color: colors.accent.primary,
    textTransform: 'uppercase',
  },
  title: textStyles.title,
  price: {
    ...textStyles.label,
    maxWidth: 104,
    color: colors.text.primary,
    textAlign: 'right',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailCell: {
    minWidth: '45%',
    flex: 1,
    gap: spacing.xxs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.elevated,
    padding: spacing.sm,
  },
  detailLabel: textStyles.caption,
  detailValue: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actionCard: {
    gap: spacing.sm,
    borderColor: colors.border.strong,
  },
  actionTitle: {
    ...textStyles.heading,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
  },
  actionHelper: textStyles.body,
  descriptionBlock: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...textStyles.heading,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
  },
  description: textStyles.body,
});
