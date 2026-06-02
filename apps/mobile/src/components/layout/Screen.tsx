import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '../../theme';

export interface ScreenProps extends ScrollViewProps {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({ children, scroll = true, contentStyle, ...props }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = layout.screenPadding + spacing.xxl + insets.bottom;

  const inner = scroll ? (
    <ScrollView
      {...props}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        { paddingBottom: bottomPadding },
        contentStyle,
        props.contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, { paddingBottom: bottomPadding }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.backdropTop} />
      <View pointerEvents="none" style={styles.backdropBand} />
      <KeyboardAvoidingView
        style={styles.avoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : undefined}
      >
        {inner}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  backdropTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 220,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  backdropBand: {
    position: 'absolute',
    top: 38,
    right: -56,
    width: 340,
    height: 54,
    backgroundColor: 'rgba(94, 234, 212, 0.055)',
    transform: [{ rotate: '-14deg' }],
  },
  avoid: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    padding: layout.screenPadding,
  },
});
