import { Tabs, useRouter } from 'expo-router';
import { CalendarSearch, Setting2, Shop } from 'iconsax-react-native';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const router = useRouter();
  const { user, token } = useSelector(state => state.auth);
  const mode = useSelector(state => state.themes)?.value || 'light';
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!user || !token) {
      router.replace('/login');
    }
  }, [user, token, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: false,
        tabBarActiveTintColor: '#f09d27',
        tabBarStyle: {
          backgroundColor: isDark ? '#2f313e' : '#F5F5F5',
          borderTopColor: isDark ? '#3a3c4a' : '#e0e0e0',
          height: 56 + Math.max(insets.bottom, 0),
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          paddingHorizontal: 8,
        },
        tabBarItemStyle: {
          minHeight: 52,
          borderRadius: 12,
          marginHorizontal: 4,
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
          paddingBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <Shop
              size={28}
              variant={focused ? 'Bulk' : 'Broken'}
              color={focused ? '#f09d27' : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="kehadiran"
        options={{
          title: 'Absensi',
          tabBarIcon: ({ color, focused }) => (
            <CalendarSearch
              size={28}
              variant={focused ? 'Bulk' : 'Broken'}
              color={focused ? '#f09d27' : color}
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
              size={28}
              variant={focused ? 'Bulk' : 'Broken'}
              color={focused ? '#f09d27' : color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
