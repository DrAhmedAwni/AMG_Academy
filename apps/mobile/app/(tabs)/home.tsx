import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Header, Screen, SectionHeader } from '../../src/components/layout';
import { GlassCard } from '../../src/components/ui';
import { EmptyState } from '../../src/components/states';
import { useAuth } from '../../src/lib/auth';
import { colors, spacing, textStyles } from '../../src/theme';

export default function HomeTab() {
  const { user } = useAuth();

  return (
    <Screen>
      <Header
        title={`Welcome${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        subtitle="Your AMG Academy mobile dashboard."
      />
      <GlassCard style={styles.heroCard}>
        <Text style={styles.kicker}>Secure session active</Text>
        <Text style={styles.title}>Events, tickets, courses, and profile are ready for V2 flows.</Text>
        <Text style={styles.body}>
          This home tab is intentionally light until dashboard data is wired in the next story phases.
        </Text>
      </GlassCard>
      <View style={styles.section}>
        <SectionHeader title="Next up" subtitle="Feature modules will fill these areas incrementally." />
        <EmptyState
          title="Dashboard content coming next"
          message="Events, tickets, courses, and notifications will use backend state as their screens are implemented."
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: spacing.sm,
  },
  kicker: {
    ...textStyles.caption,
    color: colors.accent.primary,
    textTransform: 'uppercase',
  },
  title: textStyles.heading,
  body: textStyles.body,
  section: {
    gap: spacing.sm,
  },
});
