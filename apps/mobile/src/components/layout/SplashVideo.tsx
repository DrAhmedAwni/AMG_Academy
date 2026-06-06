import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme';

interface SplashVideoProps {
  videoSource: number;
  onFinish: () => void;
}

export function SplashVideo({ videoSource, onFinish }: SplashVideoProps) {
  const insets = useSafeAreaInsets();

  const player = useVideoPlayer(videoSource, (player) => {
    player.muted = true;
    player.loop = false;
    player.play();

    player.addListener('playToEnd', () => {
      onFinish();
    });
  });

  const handleSkip = useCallback(() => {
    onFinish();
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
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
