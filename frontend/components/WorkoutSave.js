import React, { useState } from "react";
import { View, Button, TextInput, Alert } from "react-native";
import { db } from "../config"; // Connection to Firebase config
import { collection, addDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const WorkoutSave = () => {
  const [workoutName, setWorkoutName] = useState("");
  const [exerciseList, setExerciseList] = useState([]);
  const navigation = useNavigation();
  const user = { uid: "current-user-id" }; // Replace with your user ID

  const saveWorkoutPlan = async () => {
    if (!user) {
      alert("You must be logged in to save a workout.");
      return;
    }

    try {
      const workoutDocRef = await addDoc(collection(db, "workouts"), {
        userId: user.uid,
        workoutName: workoutName,
        exercises: exerciseList, // List of exercises for the current workout
        createdAt: new Date(),
      });

      console.log("Workout saved with ID: ", workoutDocRef.id);
      navigation.navigate("Main"); // Navigate to the Main screen after saving
    } catch (error) {
      console.log("Error saving workout plan", error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Enter workout name"
        value={workoutName}
        onChangeText={setWorkoutName}
      />
      {/* Add functionality for exercises input here */}
      <Button title="Save Workout" onPress={saveWorkoutPlan} />
    </View>
  );
};

export default WorkoutSave;
