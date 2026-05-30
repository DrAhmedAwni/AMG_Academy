import React from 'react';
import { Tabs } from 'expo-router';
import { BottomTabIcon } from '../../src/components/layout/BottomTabIcon';
import { SessionGate } from '../../src/features/auth/SessionGate';
import { canAccessScanner } from '../../src/features/auth/auth.types';
import { useAuth } from '../../src/lib/auth';
import { colors, typography } from '../../src/theme';

export default function TabsLayout() {
  const { user } = useAuth();
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
          },
          tabBarStyle: {
            minHeight: 64,
            borderTopColor: colors.border.default,
            backgroundColor: colors.surface.elevated,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <BottomTabIcon label="Home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ focused }) => <BottomTabIcon label="Events" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            title: 'Tickets',
            tabBarIcon: ({ focused }) => <BottomTabIcon label="Tickets" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: 'Courses',
            tabBarIcon: ({ focused }) => <BottomTabIcon label="Courses" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <BottomTabIcon label="Profile" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="staff"
          options={{
            title: 'Scanner',
            href: scannerVisible ? undefined : null,
            tabBarIcon: ({ focused }) => <BottomTabIcon label="Scanner" focused={focused} />,
          }}
        />
      </Tabs>
    </SessionGate>
  );
}
