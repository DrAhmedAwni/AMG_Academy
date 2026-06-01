import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header, Screen } from '../../src/components/layout';
import { Button } from '../../src/components/ui';
import { SessionGate } from '../../src/features/auth/SessionGate';
import { ScannerResultCard } from '../../src/features/scanner/ScannerResultCard';
import { deserializeScannerResult } from '../../src/features/scanner/scanner.hooks';
import { spacing } from '../../src/theme';

function resolveParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ScannerResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as Record<string, string | string[] | undefined>;
  const result = deserializeScannerResult(params);
  const eventId = resolveParam(params.eventId);
  const eventTitle = resolveParam(params.eventTitle);

  return (
    <SessionGate requireScanner>
      <Screen>
        <Header
          title="Scan result"
          subtitle={eventTitle || 'Backend QR validation'}
          action={<Button label="Events" variant="secondary" onPress={() => router.replace('/scanner' as never)} />}
        />

        <ScannerResultCard result={result} />

        <View style={styles.actions}>
          {eventId ? (
            <Button
              label="Scan again"
              onPress={() => {
                router.replace({
                  pathname: '/scanner/scan',
                  params: { eventId, eventTitle: eventTitle ?? '' },
                } as never);
              }}
              style={styles.actionButton}
            />
          ) : null}
          <Button
            label="Recent scans"
            variant="secondary"
            onPress={() => {
              router.push({
                pathname: '/scanner/recent',
                params: { eventId: eventId ?? '', eventTitle: eventTitle ?? '' },
              } as never);
            }}
            style={styles.actionButton}
          />
        </View>
      </Screen>
    </SessionGate>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexGrow: 1,
  },
});
