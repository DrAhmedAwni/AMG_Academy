import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header, Screen } from '../../src/components/layout';
import { ErrorState, LoadingState } from '../../src/components/states';
import { Button, GlassCard } from '../../src/components/ui';
import { EventDetailContent } from '../../src/features/events/EventDetailContent';
import {
  getRegistrationPaymentRedirect,
  useEventQuery,
  useRegisterForEventMutation,
} from '../../src/features/events/events.hooks';
import { mapApiErrorToUi } from '../../src/lib/errors';
import { spacing, textStyles } from '../../src/theme';

function resolveParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function EventDetailScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId?: string | string[] }>();
  const eventSlug = resolveParam(eventId);
  const eventQuery = useEventQuery(eventSlug);
  const registerMutation = useRegisterForEventMutation();
  const registrationError = registerMutation.error
    ? mapApiErrorToUi(registerMutation.error)
    : null;

  if (!eventSlug) {
    return (
      <Screen>
        <ErrorState title="Missing event" message="This event route is missing an identifier." />
      </Screen>
    );
  }

  if (eventQuery.isLoading) {
    return (
      <Screen>
        <LoadingState title="Loading event" message="Fetching event details from AMG Academy." />
      </Screen>
    );
  }

  if (eventQuery.isError || !eventQuery.data) {
    const error = eventQuery.error ? mapApiErrorToUi(eventQuery.error) : null;
    return (
      <Screen>
        <ErrorState
          title={error?.title ?? 'Event unavailable'}
          message={error?.message ?? 'The event could not be loaded.'}
          onRetry={() => {
            void eventQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const event = eventQuery.data;

  return (
    <Screen>
      <Header
        title="Event"
        subtitle="Registration and payment state are backend-derived."
        action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
      />
      {registrationError ? (
        <GlassCard style={styles.errorCard}>
          <Text style={styles.errorTitle}>{registrationError.title}</Text>
          <Text style={styles.errorMessage}>{registrationError.message}</Text>
        </GlassCard>
      ) : null}
      <EventDetailContent
        event={event}
        registering={registerMutation.isPending}
        onContinuePayment={(paymentId) => {
          router.push({
            pathname: '/payments/[paymentId]',
            params: { paymentId },
          } as never);
        }}
        onRegister={() => {
          void registerMutation.mutateAsync(event.id).then((registration) => {
            const redirect = getRegistrationPaymentRedirect(registration);
            if (redirect) {
              router.push({
                pathname: redirect.pathname,
                params: { paymentId: redirect.paymentId },
              } as never);
              return;
            }

            void eventQuery.refetch();
          }).catch(() => {
            // The mutation state renders the backend error message.
          });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorCard: {
    gap: spacing.xs,
  },
  errorTitle: textStyles.label,
  errorMessage: textStyles.body,
});
