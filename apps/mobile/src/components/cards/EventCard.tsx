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

function getDateParts(value: string) {
  const date = new Date(value);
  return {
    month: new Intl.DateTimeFormat('en', { month: 'short' }).format(date),
    day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date),
    time: new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date),
  };
}

function formatPrice(event: MobileEvent) {
  return event.isFree ? 'Free' : `${event.price.toLocaleString()} ${event.currency}`;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const action = getEventActionState(event);
  const dateParts = getDateParts(event.startDate);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${event.title}`}
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      <GlassCard style={styles.card}>
        <View style={styles.mediaFrame}>
        {event.thumbnailUrl ? (
          <Image source={{ uri: event.thumbnailUrl }} resizeMode="cover" style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{event.title.slice(0, 1).toUpperCase()}</Text>
            <Text style={styles.placeholderLabel}>AMG Event</Text>
          </View>
        )}
          <View style={styles.dateTile}>
            <Text style={styles.dateMonth}>{dateParts.month}</Text>
            <Text style={styles.dateDay}>{dateParts.day}</Text>
          </View>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{formatPrice(event)}</Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.kicker}>{dateParts.time} · {event.category.name}</Text>
              <Text numberOfLines={2} style={styles.title}>{event.title}</Text>
            </View>
          </View>

          <Text numberOfLines={2} style={styles.meta}>{event.location}</Text>
          <Text numberOfLines={3} style={styles.description}>
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
            <View style={styles.spotsPill}>
              <Text numberOfLines={1} style={styles.spots}>{event.remainingSpots} seats left</Text>
            </View>
            <View
              accessibilityRole="text"
              accessibilityLabel={action.label}
              style={[styles.cta, action.disabled ? styles.ctaDisabled : null]}
            >
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.82}
                numberOfLines={1}
                style={[styles.ctaText, action.disabled ? styles.ctaTextDisabled : null]}
              >
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
    overflow: 'hidden',
    padding: 0,
    borderColor: colors.border.strong,
  },
  mediaFrame: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.surface.elevated,
  },
  thumbnail: {
    width: '100%',
    height: 154,
    backgroundColor: colors.surface.elevated,
  },
  placeholder: {
    width: '100%',
    height: 154,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.background.raised,
    gap: spacing.xs,
  },
  placeholderText: {
    width: 64,
    height: 64,
    borderRadius: 32,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.interactive.pressed,
    color: colors.accent.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  placeholderLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  dateTile: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    width: 62,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.highlight,
    backgroundColor: colors.background.overlay,
  },
  dateMonth: {
    ...textStyles.caption,
    color: colors.accent.gold,
    textTransform: 'uppercase',
  },
  dateDay: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.bold,
  },
  pricePill: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    minHeight: 34,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.highlight,
    backgroundColor: colors.background.overlay,
    paddingHorizontal: spacing.md,
  },
  priceText: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
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
  title: {
    ...textStyles.heading,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
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
  spots: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  spotsPill: {
    flex: 1,
    minHeight: 34,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface.soft,
    paddingHorizontal: spacing.sm,
  },
  cta: {
    minHeight: 38,
    maxWidth: 168,
    justifyContent: 'center',
    borderRadius: radius.pill,
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
