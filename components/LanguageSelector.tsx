import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { useLangStore } from '@/_STORE/idiomas_Store';

export const LanguageSelector = () => {
  const { lang, setLang } = useLangStore();
  const [scaleAnim] = useState(new Animated.Value(1));

  const langs = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  const handlePress = (code: string) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setLang(code as any);
  };

  return (
    <View className="px-22 flex-row items-center justify-center space-x-6 ">
      {langs.map((l) => {
        const isActive = lang === l.code;
        return (
          <Animated.View
            key={l.code}
            style={{
              transform: [{ scale: isActive ? scaleAnim : 1 }],
            }}>
            <TouchableOpacity
              onPress={() => handlePress(l.code)}
              activeOpacity={0.8}
              className={`items-center justify-center rounded-3xl px-3 py-2 shadow-md ${
                isActive ? 'bg-emerald-500' : 'bg-white dark:bg-neutral-100'
              }`}
              style={{
                width: 100,
                borderWidth: isActive ? 2 : 1,
                borderColor: isActive ? '#10B981' : '#E5E7EB',
              }}>
              <Text style={{ fontSize: 24 }}>{l.flag}</Text>
              <Text
                className={`mt-1 text-sm font-semibold ${
                  isActive ? 'text-white' : 'text-gray-700'
                }`}>
                {l.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
};
