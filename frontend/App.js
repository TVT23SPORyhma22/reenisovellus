import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; // Используем createNativeStackNavigator

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingScreen from "./screens/SettingScreen";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import HomeScreen from "./screens/HomeScreen"; 
import MyPlanScreen from "./screens/MyPlanScreen";

const Stack = createNativeStackNavigator(); // Используем createNativeStackNavigator

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
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="MyPlan" component={MyPlanScreen} />
        <Stack.Screen name="Settings" component={SettingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
