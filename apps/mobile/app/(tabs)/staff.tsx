import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Header, Screen } from '../../src/components/layout';
import { Button, GlassCard } from '../../src/components/ui';
import { SessionGate } from '../../src/features/auth/SessionGate';
import { colors, spacing, textStyles } from '../../src/theme';

export default function StaffTab() {
  const router = useRouter();

  return (
    <SessionGate requireScanner>
      <Screen>
        <Header title="Scanner" subtitle="Authorized staff scanner entry point." />
        <GlassCard style={styles.card}>
          <Text style={styles.kicker}>Camera-first validation</Text>
          <Text style={styles.title}>Scan event QR tickets for attendance.</Text>
          <Text style={styles.body}>
            Select an event, open the camera, and confirm each attendee with a clear success
            or action-needed result.
          </Text>
          <View style={styles.actions}>
            <Button
              label="Open scanner"
              onPress={() => router.push('/scanner' as never)}
              style={styles.actionButton}
            />
            <Button
              label="Recent scans"
              variant="secondary"
              onPress={() => router.push('/scanner/recent' as never)}
              style={styles.actionButton}
            />
          </View>
        </GlassCard>
      </Screen>
    </SessionGate>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  kicker: {
    ...textStyles.caption,
    color: colors.accent.primary,
    textTransform: 'uppercase',
  },
  title: textStyles.heading,
  body: textStyles.body,
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexGrow: 1,
  },
});
