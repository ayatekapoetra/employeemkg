import { Tabs, useRouter } from 'expo-router';
import { CalendarSearch, Setting2, Shop } from 'iconsax-react-native';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function TabLayout() {
  const router = useRouter();
  const { user, token } = useSelector(state => state.auth);
  const mode = useSelector(state => state.themes)?.value || 'light';
  const isDark = mode === 'dark';

  useEffect(() => {
    if (!user || !token) {
      router.replace('/login');
    }
  }, [user, token]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f09d27',
        tabBarStyle: {
          backgroundColor: isDark ? '#2f313e' : '#F5F5F5',
          borderTopColor: isDark ? '#3a3c4a' : '#e0e0e0',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
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
