// RouterTab.tsx
import React, { useCallback, useState } from 'react';
import { Text, FlatList, View, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native'; // ✅ Clear button

import { Show, json_parse_search, Searched_Show } from '@/props/props';
import { ShowCard } from '@/components/showcard';
import { useShowStore } from '@/_STORE/show_Store';
import { useLangStore } from '@/_STORE/idiomas_Store';
import { db_upsertShows } from '@/sqlite';

export default function SearchScreen() {
  const [SearchedShows, setSearchedShows] = useState<Show[] | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const {
    ids_favorites: favorites,
    ids_saved: saved,
    toggleFavorite,
    toggleSave,
    store_addShows,
  } = useShowStore();
  const { t } = useLangStore();

  const handleSearch = async () => {
    if (query.trim().length === 0) return;
    setLoading(true);
    setSearchedShows(null);

    try {
      const res = await fetch(
        `https://www.imdb.com/find/?q=${encodeURIComponent(query)}&ref_=fn_nv_srb_sm`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
              '(KHTML, like Gecko) Chrome/117.0 Safari/537.36',
          },
        }
      );

      const html = await res.text();

      // extract __NEXT_DATA__ JSON safely
      const start = html.indexOf('<script id="__NEXT_DATA__" type="application/json">');
      const end = html.indexOf('</script>', start);
      const jsonText = html.substring(
        start + '<script id="__NEXT_DATA__" type="application/json">'.length,
        end
      );

      const searched_shows: Searched_Show[] = json_parse_search(jsonText);

      const shows: Show[] = [];

      for (const show of searched_shows) {
        try {
          const detailHtml = await fetch(`https://www.imdb.com/title/${show.id}/`, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/119 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          }).then((r) => r.text());

          const dStart = detailHtml.indexOf('<script id="__NEXT_DATA__" type="application/json">');
          const dEnd = detailHtml.indexOf('</script>', dStart);
          const detailJsonText = detailHtml.substring(
            dStart + '<script id="__NEXT_DATA__" type="application/json">'.length,
            dEnd
          );

          const detailJson = JSON.parse(detailJsonText);

          const pageProps = detailJson?.props?.pageProps;
          const above = pageProps.aboveTheFoldData;
          const main = pageProps.mainColumnData;

          shows.push({
            id: show.id,
            rank: above?.meterRanking?.currentRank ?? null,
            title: show.titleNameText,
            image: above?.primaryImage?.url,
            rating: above?.ratingsSummary?.aggregateRating,
            votes: above?.ratingsSummary?.voteCount,
            releaseDate: above?.releaseDate
              ? `${above.releaseDate.day ?? ''}/${above.releaseDate.month ?? ''}/${above.releaseDate.year ?? ''}`
              : undefined,
            plot: above?.plot?.plotText?.plainText || 'No plot available.',
            titleGenres: Array.isArray(above?.genres?.genres)
              ? above?.genres?.genres.map((g: any) => g?.text ?? '')
              : [],
            episodes: main?.episodes.episodes.total || null,
            trailer: above?.primaryVideos?.edges[0]?.node?.playbackURLs[0]?.url,
            seasons: main?.episodes.seasons.length,
          });
        } catch (err) {
          console.warn('Failed to fetch details for', show.id, err);
        }
      }

      //console.log(shows);

      setSearchedShows(shows);
      store_addShows(shows);
      await db_upsertShows(shows);
    } catch (err) {
      console.error('Search fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchedShows(null);
  };

  const renderItem = useCallback(
    ({ item }: { item: Show }) => (
      <ShowCard item={item} expandedId={expandedId} setExpandedId={setExpandedId} />
    ),
    [expandedId, favorites, saved, toggleFavorite, toggleSave]
  );

  return (
    <View className="flex-1 bg-gray-200 dark:bg-neutral-900">
      {/* Header */}
      <View className="bg-orange-600 px-5 pb-2 pt-10 dark:bg-orange-700">
        <Text className="text-3xl font-bold text-white">{t('search')}</Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white px-4 py-2 dark:bg-neutral-700">
        <View
          className="bg-white dark:bg-neutral-100"
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 12,
          }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('searchSeries')}
            style={{
              flex: 1,
              paddingVertical: 8,
            }}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />

          {query.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              activeOpacity={1} // 👈 no fade at all
            >
              <X size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={1} // 👈 no fade at all
          onPress={handleSearch}
          className="bg-orange-600 dark:bg-orange-700"
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            marginLeft: 8,
          }}>
          <Text className="font-semibold text-white">{t('searchButton')}</Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && (
        <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
          <ActivityIndicator size="large" color="blue" />
        </SafeAreaView>
      )}

      {/* Results */}
      {!loading && SearchedShows && (
        <FlatList
          data={SearchedShows}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 12 }}
          renderItem={renderItem}
          ListEmptyComponent={
            //ＥＭＰＴＹ ＳＵＣＣＥＳＳ ＳＴＡＴＥ
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text className="text-lg font-bold text-gray-500">{t('noShowsFound')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
