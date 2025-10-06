// imdb.tsx
import React from "react";
import { Text, View, Image, TouchableOpacity, Pressable } from "react-native";
import { Heart, Bookmark, ChevronDown, ChevronUp } from "lucide-react-native";
import { getTextClass, parseDate, Show } from "@/props/props";
import { useShowStore } from "@/███ＳＴＯＲＥ████/show_Store";

/* -------------------- MEMOIZED CARD -------------------- */
export interface ShowCardProps {
  item: Show;
  expandedId?: string | null; // optional
  setExpandedId?: (id: string | null) => void;
  isFav?: boolean;
  isSaved?: boolean;
}

export const ShowCard = function ShowCard({
  item,
  expandedId = null,
  setExpandedId = () => {},
  isFav,
  isSaved,
}: ShowCardProps) {
  const releaseDate = parseDate(item.releaseDate);
  const isFuture = releaseDate ? releaseDate.getTime() > Date.now() : false;

  const toggleFavorite = useShowStore((s) => s.toggleFavorite);
  const toggleSave = useShowStore((s) => s.toggleSave);

  return (
    <View className="bg-white border border-gray-200 mb-4 rounded-xl shadow-md overflow-hidden">
      <View className="flex-row">
        {/* Poster */}
        {item.image && (
          <Pressable
            onPress={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
          >
            <Image
              source={{ uri: item.image }}
              className="w-24 h-36"
              resizeMode="cover"
            />
          </Pressable>
        )}

        {/* Title + Details */}
        <View className="flex-1 pl-2 pb-3 justify-top">
          <View className="flex-row justify-between items-center">
            <Text className="font-bold text-lg mb-1 flex-1" numberOfLines={2}>
              {item.rank}. {item.title}
            </Text>
          </View>

          {item.releaseDate && (
            <Text className="text-sm italic">
              <Text className="font-semibold text-gray-800">Release:</Text>{" "}
              <Text className="text-gray-600">{item.releaseDate}</Text>
            </Text>
          )}
          {item.episodes && (
            <Text className="text-sm italic">
              <Text className="font-semibold text-gray-800">Episodes:</Text>{" "}
              <Text className="text-gray-600">{item.episodes}</Text>
            </Text>
          )}
          {item.titleGenres && item.titleGenres.length > 0 && (
            <Text className="text-base italic text-gray-600 mt-1">
              {item.titleGenres.join(", ")}
            </Text>
          )}
        </View>

        {/* Right Column */}
        <View className="pr-3 py-1 justify-top items-end">
          {isFuture ? (
            <Text className="text-base font-semibold text-gray-700">
              ⏳ Not Released
            </Text>
          ) : item.rating !== undefined && item.rating !== null ? (
            <>
              <Text
                className={`text-2xl font-extrabold ${getTextClass(
                  item.rating
                )} rounded`}
              >
                ⭐ {item.rating}
              </Text>
              {item.votes && (
                <Text className="text-sm text-gray-700 italic">
                  {item.votes.toLocaleString()}
                </Text>
              )}
            </>
          ) : (
            <Text className="text-base font-semibold text-gray-700">
              ⏳ Not Released
            </Text>
          )}

          <Text> </Text>

          {/* Actions */}
          <View className="flex-row mt-1 space-x-4">
            <TouchableOpacity
              activeOpacity={1} // 👈 no fade at all
              onPress={() => toggleFavorite(item)}
              className="w-[40px] h-[40px] items-center justify-center pr-1"
            >
              <Heart
                size={36}
                color={isFav ? "red" : "gray"}
                fill={isFav ? "red" : "none"}
                strokeWidth={0.6}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1} // 👈 no fade at all
              onPress={() => toggleSave(item)}
              className="w-[40px] h-[40px] items-center justify-center"
            >
              <Bookmark
                size={36}
                color={isSaved ? "#3B82F6" : "gray"}
                fill={isSaved ? "#3B82F6" : "none"}
                strokeWidth={0.6}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chevron */}
        <View className="absolute left-0 right-0 bottom-1 flex-row justify-center items-center">
          <TouchableOpacity
            activeOpacity={1} // 👈 no fade at all
            onPress={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
            className="w-10 h- items-center justify-center rounded-xl border border-gray-300 bg-white"
          >
            {expandedId === item.id ? (
              <ChevronUp size={16} color="gray" />
            ) : (
              <ChevronDown size={16} color="gray" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {expandedId === item.id && item.plot && (
        <View className="bg-white border-t-2 border-gray-200 mb-4  px-4 ">
          <Text className="text-base text-gray-700">{item.plot}</Text>
        </View>
      )}
    </View>
  );
};
