import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const ExerciseForm = ({ onAddExercise }) => {
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");

  const handleAddExercise = () => {
    if (sets && reps) {
      onAddExercise(parseInt(sets), parseInt(reps)); // Передаем количество сетов и повторений
      setSets("");
      setReps("");
    } else {
      alert("Please fill in both sets and reps.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Exercise</Text>
      <TextInput
        style={styles.input}
        value={sets}
        onChangeText={setSets}
        keyboardType="numeric"
        placeholder="Sets"
      />
      <TextInput
        style={styles.input}
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
        placeholder="Reps"
      />
      <TouchableOpacity style={styles.button} onPress={handleAddExercise}>
        <Text style={styles.buttonText}>Add Exercise</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#A0716C",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ExerciseForm;
