import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header, Screen } from '../../../src/components/layout';
import { ErrorState, LoadingState, PermissionDeniedState } from '../../../src/components/states';
import { Button, GlassCard } from '../../../src/components/ui';
import { useEnrollmentsQuery } from '../../../src/features/courses/courses.hooks';
import { getLessonVideoStreamUrl } from '../../../src/features/courses/videoAccess';
import { colors, spacing, textStyles } from '../../../src/theme';

function resolveParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type PlayerState = 'loading' | 'ready' | 'denied' | 'error' | 'no-video';

export default function LessonPlayerScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const resolvedLessonId = resolveParam(lessonId);
  const enrollmentsQuery = useEnrollmentsQuery();
  const [playerState, setPlayerState] = useState<PlayerState>('loading');

  const checkAccess = useCallback(async () => {
    if (!resolvedLessonId) return;

    setPlayerState('loading');

    try {
      const videoAccess = await getLessonVideoStreamUrl(resolvedLessonId);

      if (videoAccess.available) {
        setPlayerState('ready');
      } else {
        setPlayerState('denied');
      }
    } catch {
      setPlayerState('error');
    }
  }, [resolvedLessonId]);

  useEffect(() => {
    void checkAccess();
  }, [checkAccess]);

  if (!resolvedLessonId) {
    return (
      <Screen>
        <ErrorState title="Missing lesson" message="This lesson route is missing an identifier." />
      </Screen>
    );
  }

  if (playerState === 'loading') {
    return (
      <Screen>
        <LoadingState
          title="Checking access"
          message="Verifying backend lesson authorization."
        />
      </Screen>
    );
  }

  if (playerState === 'denied') {
    return (
      <Screen>
        <PermissionDeniedState
          title="Lesson locked"
          message="This lesson requires backend-approved enrollment and payment. Complete payment or check your enrollment status."
          action={{ label: 'Retry', onPress: () => {
            void enrollmentsQuery.refetch().finally(() => {
              void checkAccess();
            });
          }}}
        />
      </Screen>
    );
  }

  if (playerState === 'error') {
    return (
      <Screen>
        <ErrorState
          title="Playback unavailable"
          message="The lesson video could not be loaded due to a backend authorization error."
          onRetry={() => {
            void checkAccess();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title="Lesson"
        subtitle="Authorized playback - no durable public URLs."
        action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
      />

      <GlassCard style={styles.playerCard}>
        <View style={styles.playerPlaceholder}>
          <Text style={styles.playerPlaceholderText}>Play</Text>
        </View>
        <Text style={styles.readyText}>Stream authorized by backend for this session.</Text>
      </GlassCard>

      <Text style={styles.disclaimer}>
        Protected video streaming is authorized by the backend. No durable public video URLs are
        stored or exposed.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  playerCard: {
    gap: spacing.md,
    overflow: 'hidden',
    padding: 0,
  },
  playerPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerPlaceholderText: {
    fontSize: 48,
    color: colors.text.muted,
  },
  readyText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    padding: spacing.md,
  },
  disclaimer: {
    ...textStyles.caption,
    color: colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
