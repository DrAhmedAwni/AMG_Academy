import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
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
type StreamSource = { uri: string; headers?: Record<string, string> };

export default function LessonPlayerScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const resolvedLessonId = resolveParam(lessonId);
  const enrollmentsQuery = useEnrollmentsQuery();
  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [streamSource, setStreamSource] = useState<StreamSource | null>(null);
  const player = useVideoPlayer(streamSource, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  const checkAccess = useCallback(async () => {
    if (!resolvedLessonId) return;

    setPlayerState('loading');

    try {
      const videoAccess = await getLessonVideoStreamUrl(resolvedLessonId);

      if (videoAccess.available) {
        setStreamSource({
          uri: videoAccess.streamUrl,
          ...(videoAccess.authorization ? { headers: { Authorization: videoAccess.authorization } } : {}),
        });
        setPlayerState('ready');
      } else {
        setStreamSource(null);
        setPlayerState('denied');
      }
    } catch {
      setStreamSource(null);
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
          message="Checking that this lesson is available for your account."
        />
      </Screen>
    );
  }

  if (playerState === 'denied') {
    return (
      <Screen>
        <PermissionDeniedState
          title="Lesson locked"
          message="This lesson requires an active enrollment and completed payment."
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
          message="The lesson video could not be loaded right now."
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
        subtitle="Protected playback for enrolled learners."
        action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
      />

      <GlassCard style={styles.playerCard}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls
        />
        <Text style={styles.readyText}>Your lesson is ready to play for this session.</Text>
      </GlassCard>

      <Text style={styles.disclaimer}>
        Course videos are streamed inside AMG Academy and are not shared as public links.
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
  video: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface.elevated,
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
