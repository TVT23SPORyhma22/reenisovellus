import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingScreen from "./screens/SettingScreen";
import BottomTabNavigator from "./navigation/BottomTabNavigator";

const Stack = createStackNavigator();

function Home() {
  return <BottomTabNavigator />;
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={Home} />
        <Stack.Screen name="Profile" component={ProfileScreen} /> 
        <Stack.Screen name="Settings" component={SettingScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
