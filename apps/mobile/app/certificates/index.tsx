import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, Screen } from '../../src/components/layout';
import { Badge, Button, GlassCard } from '../../src/components/ui';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { SessionGate } from '../../src/features/auth/SessionGate';
import {
  getCertificatePublicDownloadUrl,
  type MobileCertificate,
} from '../../src/features/certificates/certificates.api';
import { useCertificatesQuery } from '../../src/features/certificates/certificates.hooks';
import { colors, radius, spacing, textStyles, typography } from '../../src/theme';

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'Not issued';
}

function CertificateCard({ certificate }: { certificate: MobileCertificate }) {
  const openVerification = () => {
    void Linking.openURL(certificate.verificationUrl);
  };

  const openPdf = () => {
    void Linking.openURL(getCertificatePublicDownloadUrl(certificate));
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name="ribbon" size={22} color={colors.accent.primary} />
        </View>
        <View style={styles.cardTitleWrap}>
          <Text numberOfLines={2} style={styles.title}>{certificate.sourceTitle}</Text>
          <Text numberOfLines={1} style={styles.number}>{certificate.certificateNumber}</Text>
        </View>
        <Badge label={certificate.sourceType} />
      </View>

      <View style={styles.detailGrid}>
        <View style={styles.detailPill}>
          <Text style={styles.detailLabel}>Issued</Text>
          <Text style={styles.detailValue}>{formatDate(certificate.issuedAt)}</Text>
        </View>
        <View style={styles.detailPill}>
          <Text style={styles.detailLabel}>Issuer</Text>
          <Text style={styles.detailValue}>{certificate.issuerName}</Text>
        </View>
        <View style={styles.detailPill}>
          <Text style={styles.detailLabel}>Hours</Text>
          <Text style={styles.detailValue}>{certificate.hours ?? '-'}</Text>
        </View>
        <View style={styles.detailPill}>
          <Text style={styles.detailLabel}>Credits</Text>
          <Text style={styles.detailValue}>{certificate.credits ?? '-'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button label="Verify" variant="secondary" size="sm" onPress={openVerification} />
        <Button label="PDF" size="sm" onPress={openPdf} />
      </View>
    </GlassCard>
  );
}

export default function CertificatesScreen() {
  const certificatesQuery = useCertificatesQuery({ limit: 50 });
  const certificates = certificatesQuery.data?.data ?? [];

  return (
    <SessionGate>
      <Screen contentStyle={styles.screen}>
        <Header title="Certificates" subtitle="Your released AMG Academy achievements." />

        {certificatesQuery.isLoading ? (
          <LoadingState title="Loading certificates" />
        ) : certificatesQuery.isError ? (
          <ErrorState
            title="Could not load certificates"
            message={certificatesQuery.error?.message ?? 'Please try again.'}
            onRetry={() => certificatesQuery.refetch()}
          />
        ) : certificates.length === 0 ? (
          <EmptyState
            title="No certificates yet"
            message="Released certificates will appear here after admin approval."
          />
        ) : (
          <View style={styles.list}>
            {certificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh certificates"
          onPress={() => certificatesQuery.refetch()}
          style={({ pressed }) => [styles.refresh, pressed ? styles.pressed : null]}
        >
          <Ionicons name="refresh" size={18} color={colors.accent.primary} />
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </Screen>
    </SessionGate>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.interactive.pressed,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.36)',
  },
  cardTitleWrap: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
  },
  number: {
    ...textStyles.caption,
    fontFamily: 'monospace',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  detailPill: {
    minWidth: '48%',
    flexGrow: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xxs,
  },
  detailLabel: textStyles.caption,
  detailValue: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  refresh: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
  },
  pressed: {
    opacity: 0.86,
  },
  refreshText: {
    color: colors.accent.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
});
