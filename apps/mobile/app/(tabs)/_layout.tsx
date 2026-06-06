import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabIcon } from '../../src/components/layout/BottomTabIcon';
import { SessionGate } from '../../src/features/auth/SessionGate';
import { colors, layout, spacing, typography } from '../../src/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SessionGate>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent.primary,
          tabBarInactiveTintColor: colors.text.muted,
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: {
            fontSize: typography.size.xs,
            fontWeight: typography.weight.semibold,
            paddingBottom: spacing.xs,
          },
          tabBarStyle: {
            position: 'absolute',
            left: spacing.lg,
            right: spacing.lg,
            bottom: Math.max(insets.bottom, spacing.sm),
            height: layout.bottomTabHeight,
            paddingTop: spacing.xs,
            paddingBottom: spacing.xs,
            borderRadius: 28,
            borderWidth: 1,
            borderTopWidth: 1,
            borderColor: colors.border.strong,
            backgroundColor: colors.surface.glass,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 14 },
            shadowOpacity: 0.34,
            shadowRadius: 26,
            elevation: 10,
          },
          tabBarItemStyle: {
            borderRadius: 22,
            marginVertical: spacing.xs,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <BottomTabIcon label="Home" name={focused ? 'home' : 'home-outline'} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: 'Courses',
            tabBarIcon: ({ focused }) => (
              <BottomTabIcon label="Courses" name={focused ? 'school' : 'school-outline'} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ focused }) => (
              <BottomTabIcon label="Events" name={focused ? 'calendar' : 'calendar-outline'} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarIcon: ({ focused }) => (
              <BottomTabIcon label="Community" name={focused ? 'people' : 'people-outline'} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <BottomTabIcon label="Profile" name={focused ? 'person' : 'person-outline'} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="cases"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="study-groups"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="staff"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </SessionGate>
  );
}
