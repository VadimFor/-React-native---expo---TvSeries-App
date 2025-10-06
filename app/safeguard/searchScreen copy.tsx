// RouterTab.tsx
import React, { useState } from "react";
import {
  Text,
  FlatList,
  View,
  ActivityIndicator,
  Image,
  UIManager,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native"; // ✅ Clear button

import { json_parse_search, Searched_Show } from "@/props/props";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SearchScreen() {
  const [SearchedShows, setSearchedShows] = useState<Searched_Show[] | null>(
    null
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (query.trim().length === 0) return;
    setLoading(true);
    setSearchedShows(null);

    try {
      const res = await fetch(
        `https://www.imdb.com/find/?q=${encodeURIComponent(
          query
        )}&ref_=fn_nv_srb_sm`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
              "(KHTML, like Gecko) Chrome/117.0 Safari/537.36",
          },
        }
      );

      const html = await res.text();

      // extract __NEXT_DATA__ JSON safely
      const start = html.indexOf(
        '<script id="__NEXT_DATA__" type="application/json">'
      );
      const end = html.indexOf("</script>", start);
      const jsonText = html.substring(
        start + '<script id="__NEXT_DATA__" type="application/json">'.length,
        end
      );

      const shows = json_parse_search(jsonText);
      setSearchedShows(shows);
    } catch (err) {
      console.error("Search fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSearchedShows(null);
  };

  return (
    <View className="flex-1 bg-gray-300">
      {/* Header */}
      <View className="bg-orange-600 pt-10 px-5 pb-2">
        <Text className="text-white text-3xl font-bold">Search</Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row px-4 py-2 bg-white items-center">
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            paddingHorizontal: 12,
            backgroundColor: "white",
          }}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search series..."
            style={{
              flex: 1,
              paddingVertical: 8,
            }}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />

          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <X size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSearch}
          style={{
            backgroundColor: "#ea580c",
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            marginLeft: 8,
          }}
        >
          <Text className="text-white font-semibold">Search</Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && (
        <SafeAreaView className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="blue" />
        </SafeAreaView>
      )}

      {/* Results */}
      {!loading && SearchedShows && (
        <FlatList
          data={SearchedShows}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <View className="bg-white border border-gray-200 mb-4 rounded-xl shadow-md overflow-hidden">
              <View className="flex-row">
                {item.titlePosterImageModel_url && (
                  <Image
                    source={{ uri: item.titlePosterImageModel_url }}
                    className="w-24 h-36"
                    resizeMode="cover"
                  />
                )}

                <View className="flex-1 pl-2 pb-3 justify-top">
                  <Text
                    className="font-bold text-lg mb-1 flex-1"
                    numberOfLines={2}
                  >
                    {item.titleNameText}
                  </Text>

                  {item.titleReleaseText && (
                    <Text className="text-sm italic">
                      <Text className="font-semibold text-gray-800">
                        Release:
                      </Text>{" "}
                      <Text className="text-gray-600">
                        {item.titleReleaseText}
                      </Text>
                    </Text>
                  )}
                  {item.topCredits && item.topCredits.length > 0 && (
                    <Text className="text-sm text-gray-600 mt-1">
                      {item.topCredits.join(", ")}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
