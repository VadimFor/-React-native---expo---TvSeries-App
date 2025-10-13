import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { Heart, Bookmark } from 'lucide-react-native';
import { useShowStore } from '@/_STORE/show_Store';
import { ShowCard } from '@/components/showcard';
import { useLangStore } from '@/_STORE/idiomas_Store';

export default function Liked() {
  const { store_getFavoriteShows, store_getSavedShows, loading } = useShowStore();

  const favorites = store_getFavoriteShows();
  const saved = store_getSavedShows();

  const [page, setPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { lang, t } = useLangStore();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <ActivityIndicator size="large" color="blue" />
        <Text className="mt-2 text-gray-600 dark:text-white">{t('loadingSaved')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-gray-200 dark:bg-neutral-900">
      {/* Header */}
      <View className="pb- bg-red-500 px-5 pt-10 dark:bg-red-800">
        <Text className="text-3xl font-bold text-white">{t('liked')}</Text>
      </View>

      {/* Tabs */}
      <View className="relative flex-row bg-white shadow-sm dark:bg-neutral-900">
        <TouchableOpacity
          activeOpacity={1} // 👈 no fade at all
          onPress={() => pagerRef.current?.setPage(0)}
          className="w-1/2 flex-row items-center justify-center py-3">
          <Heart
            size={20}
            color={page === 0 ? 'black' : 'gray'}
            fill={page === 0 ? 'red' : 'none'}
          />
          <Text
            className={`ml-2 text-xl font-bold ${page === 0 ? 'text-red-500 ' : 'text-gray-700 dark:text-white'}`}>
            {t('followed')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={1} // 👈 no fade at all
          onPress={() => pagerRef.current?.setPage(1)}
          className="w-1/2 flex-row items-center justify-center py-3">
          <Bookmark
            size={20}
            color={page === 1 ? 'black' : 'gray'}
            fill={page === 1 ? '#3B82F6' : 'none'}
          />
          <Text
            className={`ml-2 text-xl font-bold ${page === 1 ? 'text-blue-500' : 'text-gray-700 dark:text-white'}`}>
            {t('saved')}
          </Text>
        </TouchableOpacity>

        <View
          className={`absolute bottom-0 h-0.5 ${page === 1 ? 'bg-blue-500' : 'bg-red-500'}`}
          style={{ width: '50%', left: `${page * 50}%` }}
        />
      </View>

      {/* Pager */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}>
        {/* Page 0: Favorites */}
        <View key="1">
          <FlatList
            extraData={favorites} // ✅ forces re-render when favorites updates
            contentContainerStyle={{ padding: 12 }}
            data={favorites}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <ShowCard item={item} expandedId={expandedId} setExpandedId={setExpandedId} />
            )}
            ListEmptyComponent={
              //ＥＭＰＴＹ ＳＵＣＣＥＳＳ ＳＴＡＴＥ
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text className="text-lg font-bold text-gray-500">{t('noShowsFound')}</Text>
              </View>
            }
          />
        </View>

        {/* Page 2 Saved */}
        <View key="2">
          <FlatList
            extraData={saved}
            contentContainerStyle={{ padding: 12 }}
            data={saved}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <ShowCard item={item} expandedId={expandedId} setExpandedId={setExpandedId} />
            )}
            ListEmptyComponent={
              //ＥＭＰＴＹ ＳＵＣＣＥＳＳ ＳＴＡＴＥ
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text className="text-lg font-bold text-gray-500">{t('noShowsFound')}</Text>
              </View>
            }
          />
        </View>
      </PagerView>
    </View>
  );
}
