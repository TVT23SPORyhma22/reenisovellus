import React from "react";
import { View, Text, StyleSheet } from "react-native";

const RuokailuScreen = () => (
  <View style={styles.container}>
    <Text>Ruokailu screen (питание)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RuokailuScreen;



