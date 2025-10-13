import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLangStore } from '@/_STORE/idiomas_Store';
import { useColorScheme } from 'nativewind';
import { Moon, Sun } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const { t } = useLangStore();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-6 pt-10 dark:bg-gray-900">
      <Text className="mb-6 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
        {t('language')}
      </Text>

      <View className="items-center">
        <LanguageSelector />
      </View>

      <View className="mt-12 items-center border-t border-gray-300 pt-6 dark:border-gray-700"></View>

      <Text className="mb-6 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
        {t('darkMode')}
      </Text>

      {/* Modern Dark Mode Toggle */}
      <View className="mt-10 items-center">
        <TouchableOpacity
          onPress={async () => {
            const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
            toggleColorScheme();
            await AsyncStorage.setItem('colorScheme', newScheme);
          }}
          activeOpacity={0.8}
          className="flex-row items-center space-x-3 rounded-full bg-emerald-500 px-6 py-3 shadow-lg dark:bg-emerald-600">
          {isDark ? <Sun size={22} color="white" /> : <Moon size={22} color="white" />}
          <Text className="text-base font-semibold text-white">
            {isDark ? t('switchToLightMode') : t('switchToDarkMode')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
