import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; 

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingScreen from "./screens/SettingScreen";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import HomeScreen from "./screens/HomeScreen"; 
import MyPlanScreen from "./screens/MyPlanScreen";
import MeasurementHistoryScreen from './screens/Measurement/MeasurementHistoryScreen';
import AddMeasurement from './screens/Measurement/AddMeasurement';
import MeasurementDetails from './screens/Measurement/MeasurementDetails';


const Stack = createNativeStackNavigator(); 

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
        <Stack.Screen name="MeasurementHistory" component={MeasurementHistoryScreen} />
        <Stack.Screen name="AddMeasurement" component={AddMeasurement} />
        <Stack.Screen name="MeasurementDetails" component={MeasurementDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
