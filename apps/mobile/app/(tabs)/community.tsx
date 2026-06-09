import React, { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header, Screen, SectionHeader } from '../../src/components/layout';
import { Badge, Button, GlassCard } from '../../src/components/ui';
import { colors, radius, spacing, textStyles, typography } from '../../src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type CommunityRoute =
  | '/(tabs)/cases'
  | '/(tabs)/study-groups'
  | '/cases/submit'
  | '/study-groups/create'
  | '/certificates';

function CommunityCard({
  icon,
  title,
  body,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: {
  icon: IconName;
  title: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <GlassCard style={styles.featureCard}>
      <View style={styles.featureHeader}>
        <View style={styles.featureIcon}>
          <Ionicons name={icon} size={22} color={colors.accent.primary} />
        </View>
        <View style={styles.featureCopy}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureBody}>{body}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Button label={primaryLabel} onPress={onPrimary} style={styles.actionButton} />
        <Button
          label={secondaryLabel}
          variant="secondary"
          onPress={onSecondary}
          style={styles.actionButton}
        />
      </View>
    </GlassCard>
  );
}

function TopicChip({ label }: { label: string }) {
  return (
    <View style={styles.topicChip}>
      <Text style={styles.topicText}>{label}</Text>
    </View>
  );
}

function QuickLink({
  icon,
  title,
  helper,
  onPress,
}: {
  icon: IconName;
  title: string;
  helper: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.quickLink, pressed ? styles.pressed : null]}
    >
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={20} color={colors.accent.primary} />
      </View>
      <View style={styles.quickCopy}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.quickHelper}>{helper}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
    </Pressable>
  );
}

export default function CommunityTab() {
  const router = useRouter();
  const goTo = (route: CommunityRoute) => {
    router.push(route as never);
  };

  return (
    <Screen contentStyle={styles.screen}>
      <Header
        title="Community"
        subtitle="Discuss clinical cases and learn with AMG Academy members."
      />

      <GlassCard style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Badge
            label="AMG community"
            foreground={colors.accent.primary}
            background="rgba(84, 217, 232, 0.14)"
            border="rgba(84, 217, 232, 0.34)"
          />
          <Ionicons name="sparkles-outline" size={20} color={colors.accent.primary} />
        </View>
        <Text style={styles.heroTitle}>Learn together between sessions</Text>
        <Text style={styles.heroBody}>
          Share cases, join focused study groups, and keep your achievements close by.
        </Text>
        <View style={styles.communityStats}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>Cases</Text>
            <Text style={styles.statLabel}>Peer discussion</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>Groups</Text>
            <Text style={styles.statLabel}>Live learning</Text>
          </View>
        </View>
        <View style={styles.topicRow}>
          {['Endo', 'Implant', 'Ortho', 'Restorative'].map((topic) => (
            <TopicChip key={topic} label={topic} />
          ))}
        </View>
      </GlassCard>

      <CommunityCard
        icon="chatbubbles-outline"
        title="Case Discussion"
        body="Browse approved clinical cases, follow replies, and submit new cases for admin review."
        primaryLabel="Browse cases"
        secondaryLabel="Submit case"
        onPrimary={() => goTo('/(tabs)/cases')}
        onSecondary={() => goTo('/cases/submit')}
      />

      <CommunityCard
        icon="people-outline"
        title="Study Groups"
        body="Browse approved groups and submit new groups for admin review."
        primaryLabel="View groups"
        secondaryLabel="Create group"
        onPrimary={() => goTo('/(tabs)/study-groups')}
        onSecondary={() => goTo('/study-groups/create')}
      />

      <View style={styles.section}>
        <SectionHeader title="More from AMG" />
        <QuickLink
          icon="ribbon-outline"
          title="Certificates"
          helper="View your released achievements"
          onPress={() => goTo('/certificates')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  heroCard: {
    gap: spacing.md,
    borderColor: 'rgba(94, 234, 212, 0.28)',
    backgroundColor: 'rgba(13, 34, 48, 0.92)',
    padding: spacing.xl,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroTitle: {
    ...textStyles.heading,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
  },
  heroBody: textStyles.body,
  communityStats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.soft,
    padding: spacing.md,
  },
  statBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
  statValue: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.bold,
  },
  statLabel: textStyles.caption,
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.md,
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  topicChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  topicText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  featureCard: {
    gap: spacing.lg,
    borderColor: colors.border.strong,
  },
  featureHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(84, 217, 232, 0.34)',
    backgroundColor: colors.interactive.pressed,
  },
  featureCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  featureTitle: {
    ...textStyles.heading,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
  },
  featureBody: textStyles.body,
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexGrow: 1,
  },
  section: {
    gap: spacing.sm,
  },
  quickLink: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  quickIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.interactive.pressed,
  },
  quickCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  quickTitle: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
  },
  quickHelper: textStyles.caption,
});
