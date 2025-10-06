import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Pressable, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/*
const data = JSON.parse(document.getElementById("__NEXT_DATA__").textContent);
console.log(data);
*/

const index = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Define tamaños responsive basados en pantalla
  const iconSize = width < 350 ? 24 : width < 450 ? 28 : 32;
  const borderRadiusValue = width < 350 ? 12 : width < 450 ? 16 : 20;

  // Altura base, ajustada con safe area bottom y porcentaje relativo
  const baseHeight = 50;
  const tabBarHeight = baseHeight + insets.bottom + height * 0.02;

  // Padding bottom para que quede bien separado del safe area
  const paddingBottom = 5 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "#999",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontWeight: "bold", // Make font bold
        },
        tabBarStyle: {
          backgroundColor: "white",
          height: tabBarHeight,
          paddingBottom: paddingBottom,
          borderTopLeftRadius: borderRadiusValue,
          borderTopRightRadius: borderRadiusValue,
          overflow: "hidden",
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarButton: ({ onPress, children, accessibilityLabel }) => (
          <Pressable
            onPress={onPress}
            android_ripple={null}
            accessibilityLabel={accessibilityLabel}
            className="flex-1 justify-center items-center"
          >
            {children}
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="imdb"
        options={{
          title: "Popular",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="delta"
              color={color}
              size={iconSize + 5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Liked"
        options={{
          title: "Liked",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="bookmark-multiple"
              color={color}
              size={iconSize + 5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="searchScreen"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="search-web"
              color={color}
              size={iconSize + 5}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default index;
