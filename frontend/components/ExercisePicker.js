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
      // Only store translations that are in the specified language
      data.results.forEach(translation => {
        // Check if the translation language is English (language code = 2)
        if (translation.language === 2) {
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

const ExercisePicker = ({ exercises }) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [translations, setTranslations] = useState({});
  
  useEffect(() => {
    const loadTranslations = async () => {
      const fetchedTranslations = await fetchExerciseTranslations(2); // Fetch translations for language code 2 (English)
      setTranslations(fetchedTranslations);
    };

    loadTranslations();
  }, []);

  const addExercise = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to add exercises."); // jos käyttäjä ei ole kirjautunut sisään
      return;
    }

    const exerciseName = translations[selectedExerciseId];
  
    try {
      const exercisesRef = collection(db, "exercises");
  
      await addDoc(exercisesRef, {
        name: exerciseName,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : 0,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
  
      setSets('');
      setReps('');
      setWeight('');
      setSelectedExerciseId(null);
  
      Alert.alert("Success", "Exercise added successfully!");
  
     
    } catch (error) {
      console.error("Error adding exercise: ", error);
      Alert.alert("Error", "Failed to add exercise");
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Valitse liike</Text>
      <Picker
        selectedValue={selectedExerciseId}
        onValueChange={(value) => setSelectedExerciseId(value)}
        style={styles.picker}
      >
        <Picker.Item label="-- Valitse liike --" value="" />
        {exercises
          .filter((exercise) => translations[exercise.id])  // Only show exercises with English translations
          .map((exercise) => (
            <Picker.Item
              key={exercise.id}
              label={translations[exercise.id]}  // Using translation for English language only
              value={exercise.id}
            />
          ))}
      </Picker>

      <Text style={styles.title}>Setit</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={sets}
        onChangeText={setSets}
        placeholder="Enter sets"
      />

      <Text style={styles.title}>Toistot</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={reps}
        onChangeText={setReps}
        placeholder="Enter reps"
      />
      <Text style={styles.title}>Paino (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        placeholder="Enter weight"
      />
      <TouchableOpacity style={styles.button} onPress={addExercise}>
        <Text style={styles.buttonText}>Lisää listaan</Text>
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