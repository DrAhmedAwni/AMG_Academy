import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { PaymentStatus, QRTicketStatus, RegistrationStatus } from '@amg/shared';
import { GlassCard, StatusBadge } from '../ui';
import { getEventActionState, type MobileEvent } from '../../features/events/events.api';
import { colors, radius, spacing, textStyles, typography } from '../../theme';

export interface EventCardProps {
  event: MobileEvent;
  onPress?: (event: GestureResponderEvent) => void;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatPrice(event: MobileEvent) {
  return event.isFree ? 'Free' : `${event.price.toLocaleString()} ${event.currency}`;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const action = getEventActionState(event);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${event.title}`}
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <GlassCard style={styles.card}>
        {event.thumbnailUrl ? (
          <Image source={{ uri: event.thumbnailUrl }} resizeMode="cover" style={styles.thumbnail} />
        ) : null}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.kicker}>{formatEventDate(event.startDate)}</Text>
              <Text style={styles.title}>{event.title}</Text>
            </View>
            <Text style={styles.price}>{formatPrice(event)}</Text>
          </View>

          <Text style={styles.meta}>{event.location}</Text>
          <Text numberOfLines={2} style={styles.description}>
            {event.description}
          </Text>

          <View style={styles.badges}>
            {event.registrationStatus ? (
              <StatusBadge domain="registration" status={event.registrationStatus} />
            ) : (
              <StatusBadge domain="registration" status={RegistrationStatus.Pending} label="Open" />
            )}
            {event.paymentStatus ? (
              <StatusBadge domain="payment" status={event.paymentStatus} />
            ) : event.isFree ? (
              <StatusBadge domain="payment" status={PaymentStatus.NotRequired} />
            ) : null}
            {event.qrTicketStatus ? (
              <StatusBadge domain="qrTicket" status={event.qrTicketStatus} />
            ) : event.registrationStatus ? (
              <StatusBadge domain="qrTicket" status={QRTicketStatus.NotIssued} />
            ) : null}
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.spots}>{event.remainingSpots} seats left</Text>
            <View
              accessibilityRole="text"
              accessibilityLabel={action.label}
              style={[styles.cta, action.disabled ? styles.ctaDisabled : null]}
            >
              <Text style={[styles.ctaText, action.disabled ? styles.ctaTextDisabled : null]}>
                {action.label}
              </Text>
            </View>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  card: {
    gap: spacing.md,
    overflow: 'hidden',
    padding: 0,
  },
  thumbnail: {
    width: '100%',
    height: 132,
    backgroundColor: colors.surface.elevated,
  },
  content: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  headerRow: {
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
  price: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  meta: {
    ...textStyles.label,
    color: colors.text.secondary,
  },
  description: textStyles.body,
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  footerRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  spots: textStyles.caption,
  cta: {
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.md,
  },
  ctaDisabled: {
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  ctaText: {
    color: colors.text.inverse,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  ctaTextDisabled: {
    color: colors.text.secondary,
  },
});
