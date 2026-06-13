import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header, Screen } from '../../src/components/layout';
import { ErrorState, LoadingState, SuccessState } from '../../src/components/states';
import { Badge, Button, GlassCard, StatusBadge } from '../../src/components/ui';
import {
  getPaymentDisplayState,
  usePaymentActionMutation,
  usePaymentQuery,
} from '../../src/features/payments/payments.hooks';
import type { PaymentAction } from '../../src/features/payments/payments.api';
import { mapApiErrorToUi } from '../../src/lib/errors';
import { colors, spacing, textStyles, typography } from '../../src/theme';

function resolveParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PaymentScreen() {
  const router = useRouter();
  const { paymentId: paymentIdParam } = useLocalSearchParams<{ paymentId?: string | string[] }>();
  const paymentId = resolveParam(paymentIdParam);
  const paymentQuery = usePaymentQuery(paymentId);
  const actionMutation = usePaymentActionMutation(paymentId);
  const actionError = actionMutation.error ? mapApiErrorToUi(actionMutation.error) : null;

  const runAction = (action: PaymentAction) => {
    void actionMutation.mutateAsync(action).catch(() => {
      // The mutation state renders the error message.
    });
  };

  if (!paymentId) {
    return (
      <Screen>
        <ErrorState title="Missing payment" message="This payment route is missing an identifier." />
      </Screen>
    );
  }

  if (paymentQuery.isLoading) {
    return (
      <Screen>
        <LoadingState title="Loading payment" message="Opening your payment details." />
      </Screen>
    );
  }

  if (paymentQuery.isError || !paymentQuery.data) {
    const error = paymentQuery.error ? mapApiErrorToUi(paymentQuery.error) : null;
    return (
      <Screen>
        <ErrorState
          title={error?.title ?? 'Payment unavailable'}
          message={error?.message ?? 'The payment record could not be loaded.'}
          onRetry={() => {
            void paymentQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const payment = paymentQuery.data;
  const displayState = getPaymentDisplayState(payment);

  return (
    <Screen>
      <Header
        title="Payment"
        subtitle="Complete payment and unlock your ticket or course."
        action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
      />

      <GlassCard style={styles.card}>
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.kicker}>{payment.itemType}</Text>
            <Text style={styles.title}>{payment.itemTitle}</Text>
          </View>
          <Badge
            label={payment.mockMode ? 'Checkout' : payment.provider}
            foreground={colors.accent.primary}
            background={colors.accent.goldMuted}
            border="rgba(212, 175, 55, 0.36)"
          />
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.amount}>
            {payment.amount.toLocaleString()} {payment.currency}
          </Text>
          <StatusBadge domain="payment" status={payment.status} />
        </View>

        <Text style={styles.body}>{displayState.helper}</Text>

        {payment.providerRef ? (
          <Text style={styles.meta}>Provider reference: {payment.providerRef}</Text>
        ) : null}
        {payment.receiptRef ? <Text style={styles.meta}>Receipt: {payment.receiptRef}</Text> : null}
      </GlassCard>

      {displayState.isSuccessful ? (
        <SuccessState
          title="Payment complete"
          message="Your ticket or course access will update automatically."
        />
      ) : null}

      {actionError ? (
        <GlassCard style={styles.errorCard}>
          <Text style={styles.errorTitle}>{actionError.title}</Text>
          <Text style={styles.errorMessage}>{actionError.message}</Text>
        </GlassCard>
      ) : null}

      {payment.mockMode ? (
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Checkout actions</Text>
          <Text style={styles.body}>
            Choose a payment result to continue this AMG Academy checkout.
          </Text>
          <View style={styles.actions}>
            <Button
              label="Mark paid"
              disabled={!displayState.canMockSuccess}
              loading={actionMutation.isPending}
              onPress={() => runAction('success')}
              style={styles.actionButton}
            />
            <Button
              label="Fail"
              variant="danger"
              disabled={!displayState.canMockFail}
              loading={actionMutation.isPending}
              onPress={() => runAction('fail')}
              style={styles.actionButton}
            />
            <Button
              label="Cancel"
              variant="secondary"
              disabled={!displayState.canMockCancel}
              loading={actionMutation.isPending}
              onPress={() => runAction('cancel')}
              style={styles.actionButton}
            />
          </View>
        </GlassCard>
      ) : null}

      {payment.itemType === 'event' ? (
        <Button
          label="Open ticket wallet"
          variant="secondary"
          onPress={() => router.push('/(tabs)/tickets' as never)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  titleRow: {
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
  title: textStyles.heading,
  amountBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  amount: {
    ...textStyles.title,
    fontSize: typography.size.xl,
  },
  body: textStyles.body,
  meta: textStyles.caption,
  sectionTitle: {
    ...textStyles.heading,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexGrow: 1,
  },
  errorCard: {
    gap: spacing.xs,
  },
  errorTitle: textStyles.label,
  errorMessage: textStyles.body,
});
