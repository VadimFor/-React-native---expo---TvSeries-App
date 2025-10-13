import { Link, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';
import { useEffect, useState } from 'react';
import { restoreLastLanguage, useLangStore } from '@/_STORE/idiomas_Store';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLangStore();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 🧠 Load last language + theme on startup
  useEffect(() => {
    (async () => {
      restoreLastLanguage();

      const savedScheme = await AsyncStorage.getItem('colorScheme');
      if (savedScheme === 'light' || savedScheme === 'dark') {
        setColorScheme(savedScheme); // 👈 restore saved theme to nativewind
      }
    })();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: isDark ? '#0A84FF' : '#007AFF', // 💙 iOS Blue
        tabBarInactiveTintColor: isDark ? '#A0A0A0' : '#666666',
        tabBarLabelStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', // dark surface
          borderTopColor: isDark ? '#2C2C2E' : '#E5E5E5',
          height: 70 + insets.bottom,
          elevation: 5,
        },
      }}>
      {/* 🟢 Popular Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('popular'),
          tabBarLabel: t('popular'),
          tabBarIcon: ({ color }) => <TabBarIcon name="fire" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />

      {/* ❤️ Liked Tab */}
      <Tabs.Screen
        name="Liked"
        options={{
          title: t('liked'),
          tabBarLabel: t('liked'),
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
        }}
      />

      {/* 🔍 Search Tab */}
      <Tabs.Screen
        name="Search"
        options={{
          title: t('search'),
          tabBarLabel: t('search'),
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />

      {/* ⚙️ Settings Tab */}
      <Tabs.Screen
        name="Settings"
        options={{
          title: t('settings'),
          tabBarLabel: t('settings'),
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
