import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Video, ResizeMode, type AVPlaybackStatus } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme';

interface SplashVideoProps {
  videoSource: number;
  onFinish: () => void;
}

export function SplashVideo({ videoSource, onFinish }: SplashVideoProps) {
  const videoRef = useRef<Video>(null);
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isFinished) {
      onFinish();
    }
  }, [isFinished, onFinish]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish && !status.isLooping) {
      setIsFinished(true);
    }
  };

  const handleSkip = () => {
    setIsFinished(true);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isMuted
        isLooping={false}
        onReadyForDisplay={() => setIsReady(true)}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
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
