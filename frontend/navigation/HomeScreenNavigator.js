import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";


import MyPlanScreen from "../screens/MyPlanScreen";
import RuokailuScreen from "../screens/NutricionScreen";
import WorkoutsScreen from "../screens/WorkoutsScreen";

const Tab = createMaterialTopTabNavigator();

const HomeScreenNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarActiveTintColor: "#A0716C",
        tabBarInactiveTintColor: "gray",
        tabBarIndicatorStyle: { backgroundColor: "#A0716C" },
      }}
    >
      <Tab.Screen name="Food" component={RuokailuScreen} />
      <Tab.Screen name="My Plan" component={MyPlanScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
    </Tab.Navigator>
  );
};

export default HomeScreenNavigator;
