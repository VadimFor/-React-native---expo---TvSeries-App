import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useShowStore } from '@/_STORE/show_Store';
import { useLangStore } from '@/_STORE/idiomas_Store';
import { Heart, Bookmark, ArrowLeft, Play } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { db_upsertShow } from '@/sqlite';
import { Show } from '@/props/props';
import { PanResponder } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width, height } = Dimensions.get('window');

export default function ShowDetails() {
  const { show_id } = useLocalSearchParams<{ show_id: string }>();
  const router = useRouter();
  const { t } = useLangStore();
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);

  const show = useShowStore((s) => s.shows.find((i) => i.id === show_id));
  const {
    store_getFavoriteShows,
    store_getSavedShows,
    store_addInfoShow,
    toggleFavorite,
    toggleSave,
    ids_favorites,
    ids_saved,
  } = useShowStore();

  const favorites = store_getFavoriteShows();
  const saved = store_getSavedShows();

  useEffect(() => {
    // Allow any orientation while viewing details
    ScreenOrientation.unlockAsync();

    // (Optional) lock back to portrait when leaving
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Start gesture if user swipes horizontally more than vertically
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        // Swipe right → go back
        if (gestureState.dx > 60) {
          router.back();
        }
      },
    })
  ).current;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        //console.log(JSON.parse(document.querySelector('script#__NEXT_DATA__').textContent))
        const detailHtml = await fetch(
          `https://www.imdb.com/title/${encodeURIComponent(show_id)}/?ref_=chttvm_i_1`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/119 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          }
        ).then((r) => r.text());

        // extract JSON without regex → string methods
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

        const trailer = above?.primaryVideos?.edges[0]?.node?.playbackURLs[0]?.url;
        const seasons = main?.episodes.seasons.length;

        if (show && (trailer || seasons)) {
          store_addInfoShow(show_id, { trailer, seasons });

          const updatedShow: Show = {
            ...show,
            trailer: trailer ?? show.trailer,
            seasons: seasons ?? show.seasons,
          };
          await db_upsertShow(updatedShow);
        }
      } catch (err) {
        console.error('IMDb fetch individual show error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isFav = favorites.some((f) => f.id === show_id);
  const isSaved = saved.some((f) => f.id === show_id);

  if (!show) {
    return (
      <SafeAreaView
        {...panResponder.panHandlers}
        className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-lg text-gray-500">{t('noShowsFound')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      {...panResponder.panHandlers}
      className="flex-1 bg-black"
      edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 80 }}
        scrollEnabled={true}
        nestedScrollEnabled={true}>
        {/* --- Cinematic header --- */}
        <View className="relative">
          <Image
            source={{ uri: show.image }}
            className="absolute h-[450px] w-full opacity-40"
            blurRadius={20}
          />

          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800 }}>
            <Image source={{ uri: show.image }} className="h-[500px] w-full" resizeMode="cover" />
          </MotiView>

          <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </View>

        {/* --- Details Card --- */}
        <View className="mt-[-40px] rounded-t-3xl bg-[#111] px-5 pb-12 pt-6">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="flex-1 pr-3 text-3xl font-bold text-white" numberOfLines={2}>
              {show.title}
            </Text>

            {show.rating && (
              <Text className="text-2xl font-bold text-yellow-400"> {show.rating} ⭐</Text>
            )}
          </View>

          {show.releaseDate && (
            <Text className="mb-1 text-xl text-gray-300">
              <Text className="font-semibold">{t('releaseDate')}:</Text> {show.releaseDate}
            </Text>
          )}

          {show.episodes && (
            <Text className="mb-1 text-xl text-gray-300">
              <Text className="font-semibold">{t('episodes')}:</Text> {show.episodes}
            </Text>
          )}

          {show.seasons !== undefined && show.seasons !== null ? (
            <Text className="mb-1 text-xl text-gray-300">
              <Text className="font-semibold">{t('seasons') || 'Seasons'}:</Text> {show.seasons}
            </Text>
          ) : (
            <View className="mb-1 flex-row items-center">
              {/* Choose one of the loaders below */}
              {/* A: Spinner */}
              <ActivityIndicator size="small" color="#f97316" style={{ marginRight: 8 }} />
              {/* B: GIF */}
              {/* <Image source={loadingGif} style={{ width: 24, height: 24, marginRight: 8 }} /> */}
              <Text className="text-xl text-gray-400">{t('loadingSeasons')}</Text>
            </View>
          )}

          {show.titleGenres && show.titleGenres.length > 0 && (
            <Text className="mb-3 text-xl italic text-gray-400">{show.titleGenres.join(', ')}</Text>
          )}

          {show.plot && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 300, duration: 700 }}>
              <Text className="text-lg leading-6 text-gray-200">{show.plot}</Text>
            </MotiView>
          )}

          {/* 🎬 Inline trailer window with click-to-play or loader */}
          {show.trailer ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 400, duration: 800 }}
              className="relative mt-6 overflow-hidden rounded-2xl">
              {isPlaying ? (
                <Video
                  ref={videoRef}
                  source={{ uri: show.trailer }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isMuted={false}
                  onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                    if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
                  }}
                  style={{ width: '100%', height: 320, borderRadius: 16 }}
                />
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsPlaying(true)}
                  className="relative">
                  <Image
                    source={{ uri: show.image }}
                    className="h-[220px] w-full rounded-2xl opacity-80"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-black/50">
                      <Play size={40} color="white" />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </MotiView>
          ) : (
            <View className="mt-8 items-center justify-center">
              {/* Spinner or GIF */}
              <ActivityIndicator size="large" color="#f97316" />
              {/* <Image source={loadingGif} style={{ width: 60, height: 60 }} /> */}
              <Text className="mt-2 text-lg text-gray-400">
                {t('loadingTrailer') || 'Loading trailer...'}
              </Text>
            </View>
          )}

          {/* --- Action buttons --- */}
          <View className="mt-8 flex-row justify-center space-x-8">
            <TouchableOpacity
              onPress={() => toggleFavorite(show)}
              activeOpacity={0.8}
              className={`h-16 w-16 items-center justify-center rounded-full ${
                isFav ? 'bg-red-600' : 'bg-gray-700'
              }`}>
              <Heart size={30} color="white" fill={isFav ? 'white' : 'none'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleSave(show)}
              activeOpacity={0.8}
              className={`h-16 w-16 items-center justify-center rounded-full ${
                isSaved ? 'bg-blue-500' : 'bg-gray-700'
              }`}>
              <Bookmark size={30} color="white" fill={isSaved ? 'white' : 'none'} />
            </TouchableOpacity>
          </View>

          {/* 🌐 Cuevana search results (scrollable) */}
          <View
            className="mt-10 overflow-hidden rounded-2xl border border-gray-700"
            style={{ height: height * 0.8 }}>
            <WebView
              source={{ uri: `https://www.cuevana.is/search?q=${encodeURIComponent(show.title)}` }}
              startInLoadingState
              renderLoading={() => (
                <View className="flex-1 items-center justify-center bg-black">
                  <ActivityIndicator size="large" color="#f97316" />
                  <Text className="mt-2 text-gray-400">Cargando Cuevana...</Text>
                </View>
              )}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              scrollEnabled
              nestedScrollEnabled
              showsVerticalScrollIndicator
              bounces
              setSupportMultipleWindows={false}
              style={{ flex: 1 }}
              containerStyle={{ flex: 1 }}
              // 🚫 Block navigation to external domains
              onShouldStartLoadWithRequest={(request) => {
                const allowedDomain = 'cuevana.is';
                const url = request.url;

                if (url.includes(allowedDomain)) {
                  return true; // allow internal navigation
                }

                // ❌ Block external navigation entirely:
                return false;

                // or ✅ optionally, open it in your own in-app browser:
                // WebBrowser.openBrowserAsync(url);
                // return false;
              }}
              // extra safety for redirects or new tabs
              onNavigationStateChange={(navState) => {
                if (!navState.url.includes('cuevana.is')) {
                  // stop any unexpected redirect
                  (navState.canGoBack || navState.canGoForward) && WebBrowser.dismissBrowser();
                }
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
