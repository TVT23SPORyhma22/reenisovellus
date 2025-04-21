import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';

const bodyParts = [
  'Chest', 'Waist', 'Hip', 'Lower bust', 'Shoulder width', 'Upper hip',
  'Left upper arm', 'Right upper arm', 'Left thigh', 'Right thigh',
  'Left calf', 'Right calf'
];

export default function MeasurementScreen() {
  const [measurements, setMeasurements] = useState({});

  const handleChange = (key, value) => {
    setMeasurements({ ...measurements, [key]: value });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Body Circumference</Text>
      {bodyParts.map((part) => (
        <View key={part} style={styles.inputContainer}>
          <Text style={styles.label}>{part}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="cm"
            onChangeText={(value) => handleChange(part, value)}
            value={measurements[part] || ''}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  inputContainer: { marginBottom: 12 },
  label: { fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginTop: 4,
    borderRadius: 8
  }
});
