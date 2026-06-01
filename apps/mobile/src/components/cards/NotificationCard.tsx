import React from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import type { MobileNotification } from '../../features/notifications/notifications.api';
import { colors, radius, spacing, textStyles } from '../../theme';

export interface NotificationCardProps {
  notification: MobileNotification;
  onPress?: (event: GestureResponderEvent) => void;
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const isUnread = !notification.read;
  const date = new Date(notification.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${isUnread ? 'Unread: ' : ''}${notification.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isUnread && styles.unreadContainer,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>
          {notification.type === 'NewAnnouncement' ? '📢' : '🔔'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isUnread && styles.unreadTitle]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <Text style={[styles.message, isUnread && styles.unreadMessage]} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>

      {isUnread ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface.base + '80',
    borderWidth: 1,
    borderColor: colors.border.default + '50',
  },
  unreadContainer: {
    backgroundColor: colors.surface.elevated + 'CC',
    borderColor: colors.border.strong + '80',
  },
  pressed: {
    backgroundColor: colors.interactive.pressed,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...textStyles.label,
    color: colors.text.primary,
    flex: 1,
  },
  unreadTitle: {
    color: colors.accent.primary,
  },
  date: {
    ...textStyles.caption,
    color: colors.text.muted,
    flexShrink: 0,
  },
  message: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  unreadMessage: {
    color: colors.text.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.primary,
    flexShrink: 0,
  },
});
