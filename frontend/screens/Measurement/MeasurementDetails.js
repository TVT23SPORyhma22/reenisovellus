import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MeasurementDetails({ navigation, route }) {
  const { entry } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>
        Details for {new Date(entry.date).toLocaleDateString('ru-RU')}
      </Text>
      {Object.entries(entry.data).map(([key, value]) => (
        <Text key={key} style={styles.item}>
          {key}: {value} cm
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  backButton: { marginBottom: 20, marginTop: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  item: { fontSize: 16, marginBottom: 10 }
});
