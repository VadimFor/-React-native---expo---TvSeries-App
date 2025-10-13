// imdb.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  FlatList,
  View,
  ActivityIndicator,
  TouchableOpacity,
  UIManager,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db_upsertShows } from '@/sqlite';
import { parseDate, json_parse_top100, Show } from '@/props/props';
import { useShowStore } from '@/_STORE/show_Store';
import { ShowCard } from '@/components/showcard';

import { useLangStore } from '@/_STORE/idiomas_Store';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Imdb() {
  const {
    shows,
    ids_favorites,
    ids_saved,
    store_getFavoriteShows,
    store_getSavedShows,
    toggleFavorite,
    toggleSave,
    store_setShows,
    fetchAll,
  } = useShowStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rank' | 'releaseDate'>('rank');
  const [loading, setLoading] = useState(false);
  const { lang, t } = useLangStore();

  // Fetch IMDb page and parse __NEXT_DATA__
  useEffect(() => {
    const fetchData = async () => {
      if (shows && shows.length > 0) return;

      setLoading(true);
      try {
        //console.log(JSON.parse(document.querySelector('script#__NEXT_DATA__').textContent))
        const res = await fetch('https://www.imdb.com/chart/tvmeter/?language=en-US', {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
              '(KHTML, like Gecko) Chrome/117.0 Safari/537.36',
          },
        });
        const html = await res.text();

        // extract JSON without regex → string methods
        const start = html.indexOf('<script id="__NEXT_DATA__" type="application/json">');
        const end = html.indexOf('</script>', start);
        const jsonText = html.substring(
          start + '<script id="__NEXT_DATA__" type="application/json">'.length,
          end
        );

        const parsed: Show[] = json_parse_top100(jsonText);
        store_setShows(parsed);
        await db_upsertShows(parsed);
        fetchAll();
      } catch (err) {
        console.error('IMDb fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Show }) => (
      <ShowCard item={item} expandedId={expandedId} setExpandedId={setExpandedId} />
    ),
    [expandedId, ids_favorites, ids_saved, toggleFavorite, toggleSave]
  );

  // Sort shows
  const sortedShows = [...shows].sort((a, b) => {
    if (sortBy === 'releaseDate') {
      const da = parseDate(a.releaseDate);
      const db = parseDate(b.releaseDate);
      if (da && db) return db.getTime() - da.getTime();
      if (db) return 1;
      if (da) return -1;
      return 0;
    }

    const rankA = a.rank ?? Infinity;
    const rankB = b.rank ?? Infinity;
    return rankA - rankB;
  });

  if (loading || !shows || shows.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <ActivityIndicator size="large" color="blue" />
        <Text className="mt-3 font-semibold text-gray-600 dark:text-white">
          {t('loadingShows')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-gray-200 dark:bg-neutral-900">
      {/* Header */}
      <View className="flex-row justify-between bg-emerald-500 px-5 pb-2 pt-10 dark:bg-green-800">
        <Text className="text-3xl font-bold text-white">{t('popular')}</Text>
      </View>

      {/* Sort Toggle */}
      <View className="flex-row justify-between bg-white px-4 py-2 dark:bg-neutral-900">
        <View className="items-center justify-center rounded-full bg-gray-200 px-3 dark:bg-gray-700">
          <Text className="text-xs font-semibold text-gray-800 dark:text-white">
            {t('sortedBy')}: {sortBy === 'rank' ? t('rank') : t('releaseDate')}
          </Text>
        </View>

        <TouchableOpacity
          className="rounded-full bg-emerald-500 px-4 py-2 shadow-lg dark:bg-green-700"
          onPress={() => setSortBy(sortBy === 'rank' ? 'releaseDate' : 'rank')}
          activeOpacity={1}>
          <Text className="text-sm font-semibold text-white">
            {t('sortBy')} {sortBy === 'rank' ? t('releaseDate') : t('rank')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedShows}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
}
