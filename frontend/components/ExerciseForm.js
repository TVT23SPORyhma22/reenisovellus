// komponentti uuden harjoituksen lisäämiseen

import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../backend/config";

const auth = getAuth();

const ExerciseForm = ({ onExerciseAdded }) => {
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const resetForm = () => {
    setExerciseName("");
    setSets("");
    setReps("");
    setWeight("");
  };

  const handleSubmit = async () => {
    // pakollisena exercise, set ja rep
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to add exercises.");
      return;
    }
    // required fields
    if (!exerciseName || !sets || !reps) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    try {
      const exercisesRef = collection(db, "exercises");

      await addDoc(exercisesRef, {
        name: exerciseName,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : 0,
        userId: user.uid, // hakee userId Firebase Authin kautta
        createdAt: serverTimestamp(),
      });

      resetForm();
      Alert.alert("Success", "Exercise added successfully!");

      if (onExerciseAdded) {
        onExerciseAdded();
      }
    } catch (error) {
      console.error("Error adding exercise: ", error);
      Alert.alert("Error", "Failed to add exercise");
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Add New Exercise</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Exercise Name"
        value={exerciseName}
        onChangeText={setExerciseName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Sets"
        value={sets}
        onChangeText={setSets}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Reps"
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      
      <Button title="Add Exercise" onPress={handleSubmit} />
    </View>
  );
};


const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default ExerciseForm;