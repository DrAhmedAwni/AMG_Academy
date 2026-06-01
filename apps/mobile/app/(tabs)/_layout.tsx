import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabIcon } from '../../src/components/layout/BottomTabIcon';
import { SessionGate } from '../../src/features/auth/SessionGate';
import { canAccessScanner } from '../../src/features/auth/auth.types';
import { useAuth } from '../../src/lib/auth';
import { colors, layout, spacing, typography } from '../../src/theme';

export default function TabsLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scannerVisible = canAccessScanner(user);

  return (
    <SessionGate>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent.primary,
          tabBarInactiveTintColor: colors.text.muted,
          tabBarLabelStyle: {
            fontSize: typography.size.xs,
            fontWeight: typography.weight.semibold,
            paddingBottom: spacing.xxs,
          },
          tabBarStyle: {
            height: layout.bottomTabHeight + insets.bottom,
            paddingTop: spacing.xs,
            paddingBottom: Math.max(insets.bottom, spacing.xs),
            borderTopColor: colors.border.default,
            backgroundColor: colors.surface.elevated,
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
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ focused }) => (
              <BottomTabIcon label="Events" name={focused ? 'calendar' : 'calendar-outline'} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            title: 'Tickets',
            tabBarIcon: ({ focused }) => (
              <BottomTabIcon label="Tickets" name={focused ? 'qr-code' : 'qr-code-outline'} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="cases"
          options={{
            title: 'Cases',
            tabBarIcon: ({ focused }) => (
              <BottomTabIcon label="Cases" name={focused ? 'chatbubbles' : 'chatbubbles-outline'} focused={focused} />
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
          name="study-groups"
          options={{
            title: 'Groups',
            tabBarIcon: ({ focused }) => (
              <BottomTabIcon label="Groups" name={focused ? 'people' : 'people-outline'} focused={focused} />
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
          name="staff"
          options={{
            title: 'Scanner',
            href: scannerVisible ? undefined : null,
            tabBarIcon: ({ focused }) => (
              <BottomTabIcon label="Scanner" name={focused ? 'scan' : 'scan-outline'} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </SessionGate>
  );
}
