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
  avoid: {
    flex: 1,
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
