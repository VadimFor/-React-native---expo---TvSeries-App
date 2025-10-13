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
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native"; // ✅ Icon for clear button

import { Searched_Show } from "@/props/props";

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

  const parseHtml = (html: string): Searched_Show[] => {
    try {
      const json = JSON.parse(html);
      const raw = json?.props?.pageProps?.titleResults?.results || [];

      return raw
        .filter(
          (e: any) =>
            e.imageType === "tvMiniSeries" || e.imageType === "tvSeries"
        )
        .map(
          (e: any): Searched_Show => ({
            id: e.id,
            imageType: e.imageType,
            titleNameText: e.titleNameText,
            titlePosterImageModel_url: e.titlePosterImageModel?.url ?? null,
            titleReleaseText: e.titleReleaseText ?? "",
            titleTypeText: e.titleTypeText ?? "",
            topCredits: e.topCredits ?? [],
          })
        );
    } catch (err) {
      console.error("Parse error:", err);
      return [];
    }
  };

  const handleSearch = () => {
    if (query.trim().length > 0) {
      setLoading(true);
      setSearchedShows(null);
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

          {/* Clear button inside search bar */}
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <X size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Button */}
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

      {/* WebView only when searching */}
      {loading && (
        <SafeAreaView className="flex-1 items-center justify-center bg-white">
          <WebView
            source={{
              uri: `https://www.imdb.com/find/?q=${encodeURIComponent(
                query
              )}&ref_=fn_nv_srb_sm`,
              headers: { "Accept-Language": "en-US,en;q=0.9" },
            }}
            injectedJavaScript={`
              let tries = 0;
              const check = setInterval(() => {
                const script = document.getElementById("__NEXT_DATA__");
                if (script) {
                  window.ReactNativeWebView.postMessage(script.textContent);
                  document.head.innerHTML = "";
                  document.body.innerHTML = ""; // stops further rendering
                  clearInterval(check);
                } else if (tries++ > 20) { // stop after ~6s
                  clearInterval(check);
                }
              }, 300);
              true;
            `}
            onMessage={(e) => {
              setSearchedShows(parseHtml(e.nativeEvent.data));
              setLoading(false);
            }}
            style={{ width: 0, height: 0 }}
          />
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
                {/* Poster */}
                {item.titlePosterImageModel_url && (
                  <Image
                    source={{ uri: item.titlePosterImageModel_url }}
                    className="w-24 h-36"
                    resizeMode="cover"
                  />
                )}

                {/* Title + Details */}
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
