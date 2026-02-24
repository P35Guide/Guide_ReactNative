import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { SearchProvider } from '../../store/search-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SearchProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF7A45',
          tabBarInactiveTintColor: '#7C8A9A',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderTopWidth: 0,
            height: 40 + insets.bottom,
            paddingTop: 2,
            paddingBottom: Math.max(7, insets.bottom),
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.14,
            shadowRadius: 18,
            elevation: 20,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
          },
        }}>
        <Tabs.Screen
          name="filters"
          options={{
            title: 'Фільтри',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="options-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="places"
          options={{
            title: 'Місця',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="map-outline" color={color} />,
          }}
        />
      </Tabs>
    </SearchProvider>
  );
}
