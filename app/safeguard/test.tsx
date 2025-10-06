// SearchScreen.tsx
import React, { useState, useEffect } from "react";
import { Text, View, UIManager, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SearchScreen() {
  const [jsonData, setJsonData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch IMDb HTML
        const html = await fetch("https://www.imdb.com/title/tt27427326/", {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
          },
        }).then((r) => r.text());

        // Extract __NEXT_DATA__ JSON with regex
        const match = html.match(
          /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/
        );

        if (!match) {
          throw new Error("Could not find __NEXT_DATA__ in IMDb page");
        }

        const json = JSON.parse(match[1]);
        console.log(
          "IMDb JSON props:",
          json?.props?.pageProps?.aboveTheFoldData
        );
        setJsonData(json?.props?.pageProps?.aboveTheFoldData);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-300">
      {/* Header */}
      <View className="bg-orange-600 pt-10 px-5 pb-2">
        <Text className="text-white text-3xl font-bold">IMDb Fetch Test</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {error && (
          <Text className="text-red-600 font-semibold">Error: {error}</Text>
        )}

        {!error && !jsonData && (
          <Text className="text-black">Loading IMDb data…</Text>
        )}

        {jsonData && (
          <Text className="text-black text-xs">
            {JSON.stringify(jsonData, null, 2)}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
