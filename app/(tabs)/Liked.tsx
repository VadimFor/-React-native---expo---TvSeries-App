import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import PagerView from "react-native-pager-view";
import { Heart, Bookmark } from "lucide-react-native";
import { useShowStore } from "@/███ＳＴＯＲＥ████/show_Store";
import { ShowCard } from "../components/showcard";

export default function Liked() {
  const { loading } = useShowStore();

  const favorites = useShowStore((s) => s.favorites);
  const saved = useShowStore((s) => s.saved);

  const [page, setPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="blue" />
        <Text className="mt-2 text-gray-600">Loading saved shows...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-red-500 pt-10 px-5 pb-">
        <Text className="text-white text-3xl font-bold">Liked</Text>
      </View>

      {/* Tabs */}
      <View className="relative flex-row bg-white shadow-sm">
        <TouchableOpacity
          activeOpacity={1} // 👈 no fade at all
          onPress={() => pagerRef.current?.setPage(0)}
          className="w-1/2 py-3 flex-row justify-center items-center"
        >
          <Heart
            size={20}
            color={page === 0 ? "black" : "gray"}
            fill={page === 0 ? "red" : "none"}
          />
          <Text
            className={`ml-2 text-xl font-bold ${
              page === 0 ? "text-red-500" : "text-gray-700"
            }`}
          >
            Followed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={1} // 👈 no fade at all
          onPress={() => pagerRef.current?.setPage(1)}
          className="w-1/2 py-3 flex-row justify-center items-center"
        >
          <Bookmark
            size={20}
            color={page === 1 ? "black" : "gray"}
            fill={page === 1 ? "#3B82F6" : "none"}
          />
          <Text
            className={`ml-2 text-xl font-bold ${
              page === 1 ? "text-blue-500" : "text-gray-700"
            }`}
          >
            Saved
          </Text>
        </TouchableOpacity>

        <View
          className={`absolute bottom-0 h-0.5 ${
            page === 1 ? "bg-blue-500" : "bg-red-500"
          }`}
          style={{ width: "50%", left: `${page * 50}%` }}
        />
      </View>

      {/* Pager */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {/* Page 0: Favorites */}
        <View key="1">
          <FlatList
            extraData={favorites} // ✅ forces re-render when favorites updates
            contentContainerStyle={{ padding: 12 }}
            data={favorites}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <ShowCard
                item={item}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                isFav={favorites.some((f) => f.id === item.id)}
                isSaved={saved.some((f) => f.id === item.id)}
              />
            )}
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
              <ShowCard
                item={item}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                isFav={favorites.some((f) => f.id === item.id)}
                isSaved={saved.some((f) => f.id === item.id)}
              />
            )}
          />
        </View>
      </PagerView>
    </View>
  );
}
