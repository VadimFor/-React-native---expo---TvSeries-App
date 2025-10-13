// imdb.tsx
import React from 'react';
import { Text, View, Image, TouchableOpacity, Pressable } from 'react-native';
import { Heart, Bookmark, ChevronDown, ChevronUp } from 'lucide-react-native';
import { parseDate, Show } from '@/props/props';
import { useShowStore } from '@/_STORE/show_Store';
import { useLangStore } from '@/_STORE/idiomas_Store';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export interface ShowCardProps {
  item: Show;
  expandedId?: string | null; // optional
  setExpandedId?: (id: string | null) => void;
}

export const ShowCard = function ShowCard({
  item,
  expandedId = null,
  setExpandedId = () => {},
}: ShowCardProps) {
  const { ids_favorites, ids_saved, toggleFavorite, toggleSave } = useShowStore();

  const releaseDate = parseDate(item.releaseDate);
  const isFuture = releaseDate ? releaseDate.getTime() > Date.now() : false;

  const { lang, t } = useLangStore();
  const router = useRouter();

  const isFav = ids_favorites.some((id) => id === item.id);
  const isSaved = ids_saved.some((id) => id === item.id);

  const getTextClass = (rating: number) => {
    if (rating == null) return 'text-gray-500';
    if (rating < 6) return 'text-red-500';
    if (rating < 7) return 'text-green-600';
    if (rating < 9) return 'text-blue-600 dark:text-blue-500';
    return 'text-yellow-500';
  };

  return (
    <View className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:bg-gray-800">
      <View className="flex-row">
        {/* Poster */}
        {item.image && (
          <Pressable onPress={() => router.push(`/shows/${item.id}`)}>
            <Image source={{ uri: item.image }} className="h-36 w-24" resizeMode="cover" />
          </Pressable>
        )}

        {/* Title + Details */}
        <Pressable
          onPress={() => router.push(`/shows/${item.id}`)}
          android_ripple={{ color: '#ccc' }}
          className="justify-top flex-1 pb-3 pl-2">
          <View className="flex-row items-center justify-between">
            <Text className="mb-1 flex-1 text-lg font-bold dark:text-white" numberOfLines={2}>
              {item.rank}. {item.title}
            </Text>
          </View>

          {item.releaseDate && (
            <Text className="text-sm italic">
              <Text className="font-semibold text-gray-800 dark:text-white">
                {t('releaseDate')}:
              </Text>{' '}
              <Text className="text-gray-600 dark:text-white">{item.releaseDate}</Text>
            </Text>
          )}

          {(item.episodes || item.seasons) && (
            <Text className="text-sm italic">
              {item.episodes && (
                <>
                  <Text className="font-semibold text-gray-800 dark:text-white">
                    {t('episodes')}:
                  </Text>{' '}
                  <Text className="text-gray-600 dark:text-white">{item.episodes}</Text>
                </>
              )}
              {item.seasons && (
                <>
                  <Text className="font-semibold text-gray-800 dark:text-white">
                    {' '}
                    • {t('seasons')}:
                  </Text>{' '}
                  <Text className="text-gray-600 dark:text-white">{item.seasons}</Text>
                </>
              )}
            </Text>
          )}

          {item.titleGenres && item.titleGenres.length > 0 && (
            <Text className="mt-1 text-base italic text-gray-600 dark:text-white">
              {item.titleGenres.join(', ')}
            </Text>
          )}
        </Pressable>

        {/* Right Column */}
        <View className="justify-top items-end py-1 pr-3 ">
          {isFuture ? (
            <Text className="text-base  font-semibold text-gray-700 dark:text-white">
              ⏳ {t('notReleased')}
            </Text>
          ) : item.rating !== undefined && item.rating !== null ? (
            <>
              <Text className={`text-2xl font-extrabold ${getTextClass(item.rating)} rounded`}>
                {item.rating}
              </Text>
              {item.votes && (
                <Text className="text-sm italic text-gray-700 dark:text-white">
                  {item.votes.toLocaleString()}
                </Text>
              )}
            </>
          ) : (
            <Text className="text-base font-semibold text-gray-700 dark:text-white">
              ⏳ Not Released
            </Text>
          )}

          <Text> </Text>

          {/* Actions */}
          <View className="mt-1 flex-row space-x-4">
            <TouchableOpacity
              activeOpacity={1} // 👈 no fade at all
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 👈 vibration
                toggleFavorite(item);
              }}
              className="h-[40px] w-[40px] items-center justify-center pr-1">
              <Heart
                size={36}
                color={isFav ? 'red' : 'gray'}
                fill={isFav ? 'red' : 'none'}
                strokeWidth={0.6}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1} // 👈 no fade at all
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 👈 vibration
                toggleSave(item);
              }}
              className="h-[40px] w-[40px] items-center justify-center">
              <Bookmark
                size={36}
                color={isSaved ? '#3B82F6' : 'gray'}
                fill={isSaved ? '#3B82F6' : 'none'}
                strokeWidth={0.6}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chevron */}
        <View className="absolute bottom-1 left-0 right-0 flex-row items-center justify-center">
          <TouchableOpacity
            activeOpacity={1} // 👈 no fade at all
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 👈 vibration
              setExpandedId(expandedId === item.id ? null : item.id);
            }}
            className="h-8 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white dark:bg-neutral-900">
            {expandedId === item.id ? (
              <ChevronUp size={16} color="gray" />
            ) : (
              <ChevronDown size={16} color="gray" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {expandedId === item.id && item.plot && (
        <View className="mb-4 border-t-2 border-gray-200 bg-white px-4 dark:bg-neutral-900 ">
          <Text className="text-base text-gray-700 dark:text-white">{item.plot}</Text>
        </View>
      )}
    </View>
  );
};
