import React, { type ReactNode } from 'react';
import {
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

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.content, { paddingBottom: bottomPadding }, contentStyle]}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  content: {
    flexGrow: 1,
    gap: spacing.md,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    padding: layout.screenPadding,
  },
});
