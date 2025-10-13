// imdb.tsx
import React, { useCallback, useState } from 'react';
import {
  Text,
  FlatList,
  View,
  ActivityIndicator,
  TouchableOpacity,
  UIManager,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db_upsertShows } from '@/sqlite';
import { getTextClass, parseDate, json_parse_top100, Show } from '@/props/props';
import { logDbState, useShowStore } from '@/_STORE/show_Store';
import { ShowCard } from '../components/showcard';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Imdb() {
  const {
    shows,
    ids_favorites: favorites,
    ids_saved: saved,
    toggleFavorite,
    toggleSave,
    store_setShows,
    fetchAll,
  } = useShowStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rank' | 'releaseDate'>('rank');
  const [loaded, setLoaded] = useState(false);

  const renderItem = useCallback(
    ({ item }: { item: Show }) => (
      <ShowCard item={item} expandedId={expandedId} setExpandedId={setExpandedId} />
    ),
    [expandedId, favorites, saved, toggleFavorite, toggleSave]
  );

  if (!shows || shows.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <WebView
          source={{
            uri: 'https://www.imdb.com/chart/tvmeter/?language=en-US',
            headers: { 'Accept-Language': 'en-US,en;q=0.9' },
          }}
          injectedJavaScript={`
            const check = setInterval(() => {
              const script = document.getElementById("__NEXT_DATA__");
              if (script) {
                window.ReactNativeWebView.postMessage(script.textContent);
                document.head.innerHTML = "";
                document.body.innerHTML = ""; // stop rendering rest of page
                clearInterval(check);
              }
            }, 200);
            true;
          `}
          onMessage={async (e) => {
            if (loaded) return;
            setLoaded(true);
            const parsed: Show[] = json_parse_top100(e.nativeEvent.data);
            store_setShows(parsed);
            await db_upsertShows(parsed);
            fetchAll();
          }}
          style={{ width: 0, height: 0 }}
        />
        <ActivityIndicator size="large" color="blue" />
      </SafeAreaView>
    );
  }

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

    // Fallback: rank might be undefined → default to Infinity
    const rankA = a.rank ?? Infinity;
    const rankB = b.rank ?? Infinity;
    return rankA - rankB;
  });

  return (
    <View className="flex-1 bg-gray-300">
      {/* Header */}
      <View className="bg-emerald-500 px-5 pb-2 pt-10 ">
        <Text className="text-3xl font-bold text-white">Popular</Text>
      </View>

      {/* Sort Toggle */}
      <View className="flex-row justify-between bg-white px-4 py-2">
        <View className="items-center justify-center rounded-full bg-gray-300 px-3">
          <Text className="text-xs font-semibold text-gray-800">
            Sorted by: {sortBy === 'rank' ? 'Rank' : 'Release Date'}
          </Text>
        </View>

        <TouchableOpacity
          className="rounded-full bg-emerald-500 px-4 py-2 shadow-lg"
          onPress={() => setSortBy(sortBy === 'rank' ? 'releaseDate' : 'rank')}
          activeOpacity={0.8}>
          <Text className="text-sm font-semibold text-white">
            Sort by {sortBy === 'rank' ? 'Release Date' : 'Rank'}
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
