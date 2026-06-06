import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme';

interface SplashVideoProps {
  videoSource: number;
  onFinish: () => void;
}

export function SplashVideo({ videoSource, onFinish }: SplashVideoProps) {
  const insets = useSafeAreaInsets();
  const finishedRef = useRef(false);
  const [firstFrameRendered, setFirstFrameRendered] = useState(false);

  const player = useVideoPlayer(videoSource, (player) => {
    player.muted = true;
    player.loop = false;
    try {
      player.play();
    } catch {
      // If the intro cannot start in a preview build, the fallback timer below continues the app.
    }
  });

  const finishOnce = useCallback(() => {
    if (finishedRef.current) {
      return;
    }

    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  useEventListener(player, 'playToEnd', finishOnce);
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') {
      finishOnce();
    }
  });

  useEffect(() => {
    const timeout = setTimeout(finishOnce, 9000);
    return () => clearTimeout(timeout);
  }, [finishOnce]);

  const handleSkip = useCallback(() => {
    finishOnce();
  }, [finishOnce]);

  return (
    <View style={styles.container}>
      {!firstFrameRendered ? (
        <Image
          source={require('../../../assets/splash.png')}
          style={styles.poster}
          resizeMode="contain"
        />
      ) : null}
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="cover"
        surfaceType="textureView"
        onFirstFrameRender={() => setFirstFrameRendered(true)}
      />
      <Pressable
        onPress={handleSkip}
        style={[styles.skipButton, { top: insets.top + spacing.md }]}
        accessibilityLabel="Skip video"
        accessibilityRole="button"
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  video: {
    flex: 1,
  },
  poster: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.main,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});
