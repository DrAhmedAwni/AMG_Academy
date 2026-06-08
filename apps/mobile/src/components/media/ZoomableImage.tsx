import React, { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, textStyles, typography } from '../../theme';

interface ZoomableImageProps {
  uri: string;
  title?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain';
}

export function ZoomableImage({
  uri,
  title = 'Image preview',
  style,
  resizeMode = 'contain',
}: ZoomableImageProps) {
  const [visible, setVisible] = useState(false);
  const [zoom, setZoom] = useState(1);

  const imageStyle = useMemo(
    () => [
      styles.previewImage,
      {
        transform: [{ scale: zoom }],
      },
    ],
    [zoom],
  );

  return (
    <>
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={`Open ${title}`}
        onPress={() => {
          setZoom(1);
          setVisible(true);
        }}
      >
        <Image source={{ uri }} resizeMode={resizeMode} style={style} />
      </Pressable>

      <Modal visible={visible} animationType="fade" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.modal}>
          <View style={styles.toolbar}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close image preview"
              onPress={() => setVisible(false)}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={22} color={colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            maximumZoomScale={4}
            minimumZoomScale={1}
            centerContent
          >
            <Image source={{ uri }} resizeMode="contain" style={imageStyle} />
          </ScrollView>

          <View style={styles.zoomControls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Zoom out"
              onPress={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))}
              style={styles.zoomButton}
            >
              <Ionicons name="remove" size={20} color={colors.text.primary} />
            </Pressable>
            <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Zoom in"
              onPress={() => setZoom((value) => Math.min(4, Number((value + 0.25).toFixed(2))))}
              style={styles.zoomButton}
            >
              <Ionicons name="add" size={20} color={colors.text.primary} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.96)',
    padding: spacing.md,
  },
  toolbar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    ...textStyles.label,
    flex: 1,
    color: colors.text.primary,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: 520,
  },
  zoomControls: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  zoomButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  zoomText: {
    minWidth: 64,
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
});
