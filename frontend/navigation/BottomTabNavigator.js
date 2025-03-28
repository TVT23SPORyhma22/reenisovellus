import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import MapScreen from "../screens/MapScreen";
import ProgressScreen from "../screens/ProgressScreen"
import { Text } from "react-native";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: () => <Text style={{ fontSize: 24, fontWeight: "bold" }}>KPL Group</Text>,
        headerTitleAlign: "center",
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Calendar") iconName = "calendar";
          else if (route.name === "Favorites") iconName = "heart";
          else if (route.name === "Map") iconName = "map";
          else if (route.name === "Progress") iconName = "stats-chart-outline"; // progress sivu

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen}  options={{ headerTitle: "Progress" }} />
    </Tab.Navigator>
  );
}
