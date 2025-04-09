// screens/HomeScreen2.js
import React from "react";
import { View, StyleSheet } from "react-native";
import HomeScreenNavigator from "../navigation/HomeScreenNavigator";

const HomeScreen2 = () => {
  return (
    <View style={styles.container}>
      <HomeScreenNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40, // чтобы табы не перекрывались статус-баром
  },
});

export default HomeScreen2;
