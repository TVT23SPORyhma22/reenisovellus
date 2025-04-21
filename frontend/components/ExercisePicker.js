import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db, auth } from "../backend/config";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const fetchExerciseTranslations = async (languageCode) => {
  try {
    let translations = {};
    let url = `https://wger.de/api/v2/exercise-translation/?language=${languageCode}&limit=100`;
    let attempts = 0;
    const maxAttempts = 5;
    while (url && attempts < maxAttempts) {
      const response = await fetch(url);
      if (!response.ok) return {};

      const data = await response.json();
      data.results.forEach(translation => {
        if (translation.language === 2 && translation.name?.trim()) {

          translations[translation.exercise] = translation.name;
        }
      });

      url = data.next;
      attempts++;
    }

    return translations;
  } catch {
    return {};
  }
};

const ExercisePicker = ({ exercises, translations, onAdd }) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const handleAddExercise = () => {
    if (!selectedExerciseId || !sets || !reps) {
      Alert.alert("Error", "Please fill in all fields before adding an exercise.");
      return;
    }

    const exerciseName = translations[selectedExerciseId];
    onAdd(selectedExerciseId, exerciseName, parseInt(sets), parseInt(reps), parseFloat(weight || 0));

    // Reset fields after adding
    setSelectedExerciseId(null);
    setSets('');
    setReps('');
    setWeight('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Exercise</Text>
      <Picker
        selectedValue={selectedExerciseId}
        onValueChange={(value) => setSelectedExerciseId(value)}
        style={styles.picker}
      >
        <Picker.Item label="-- Select Exercise --" value="" />
        {exercises
          .filter((exercise) => translations[exercise.id]) // Only show exercises with translations
          .map((exercise) => (
            <Picker.Item
              key={exercise.id}
              label={translations[exercise.id]} // Use translated name
              value={exercise.id}
            />
          ))}
      </Picker>

      <Text style={styles.title}>Sets</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={sets}
        onChangeText={setSets}
        placeholder="Enter sets"
      />

      <Text style={styles.title}>Reps</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={reps}
        onChangeText={setReps}
        placeholder="Enter reps"
      />

      <Text style={styles.title}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        placeholder="Enter weight (kg)"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddExercise}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ExercisePicker;
