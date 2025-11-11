import { Tabs } from 'expo-router';
import React from 'react';
import { useColorMode } from 'native-base';
import { CalendarSearch, Trello, Shop, StatusUp, Setting2 } from 'iconsax-react-native';

export default function TabLayout() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f09d27',
        tabBarStyle: {
          backgroundColor: isDark ? '#2f313e' : '#F5F5F5',
          borderTopColor: isDark ? '#3a3c4a' : '#e0e0e0',
        },
      }}
    >
      <Tabs.Screen
        name="kehadiran"
        options={{
          title: 'Absensi',
          tabBarIcon: ({ color, focused }) => (
            <CalendarSearch
              size={32}
              variant={focused ? 'Bulk' : 'Broken'}
              color={isDark ? '#9a8f90' : '#b31e02'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tugasku"
        options={{
          title: 'Tugasku',
          tabBarIcon: ({ color, focused }) => (
            <Trello
              size={32}
              variant={focused ? 'Bulk' : 'Broken'}
              color={isDark ? '#9a8f90' : '#b31e02'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <Shop
              size={32}
              variant={focused ? 'Bulk' : 'Broken'}
              color={isDark ? '#9a8f90' : '#b31e02'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="laporan"
        options={{
          title: 'Laporan',
          tabBarIcon: ({ color, focused }) => (
            <StatusUp
              size={32}
              variant={focused ? 'Bulk' : 'Broken'}
              color={isDark ? '#9a8f90' : '#b31e02'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: 'Setting',
          tabBarIcon: ({ color, focused }) => (
            <Setting2
              size={32}
              variant={focused ? 'Bulk' : 'Broken'}
              color={isDark ? '#9a8f90' : '#b31e02'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
