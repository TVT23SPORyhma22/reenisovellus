import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { db, auth } from "../backend/config"; 
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"; 
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const MyPlanScreen = () => {
  const navigation = useNavigation();
  const [workouts, setWorkouts] = useState([]);

  // Загружаем тренировки пользователя
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("Please log in to view your workouts.");
          return;
        }

        const q = query(
          collection(db, "workouts"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const workoutsList = [];
        querySnapshot.forEach((doc) => {
          workoutsList.push({ id: doc.id, ...doc.data() });
        });

        setWorkouts(workoutsList); 
      } catch (error) {
        console.error("Error loading workouts:", error);
        Alert.alert("Error", "Failed to load workouts.");
      }
    };

    loadWorkouts();
  }, []);

  // Обработка старта тренировки
  const handleStartWorkout = async (workoutId) => {
    try {
      const workoutRef = doc(db, "workouts", workoutId);
      await updateDoc(workoutRef, {
        completed: true,
        completedAt: new Date(),
      });

      Alert.alert("Success", "Workout started and added to calendar.");
      navigation.navigate("Progress"); // Переход к странице Progress
    } catch (error) {
      console.error("Error starting workout:", error);
      Alert.alert("Error", "Failed to start workout.");
    }
  };

  // Удаление тренировки
  const deleteWorkout = async (workoutId) => {
    try {
      await deleteDoc(doc(db, "workouts", workoutId));
      setWorkouts(workouts.filter((workout) => workout.id !== workoutId));
    } catch (error) {
      console.error("Error deleting workout:", error);
      Alert.alert("Error", "Failed to delete workout.");
    }
  };

  // Подтверждение удаления тренировки
  const handleLongPress = (workoutId) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteWorkout(workoutId) },
      ]
    );
  };

  // Рендерим тренировку
  const renderWorkout = ({ item }) => (
    <TouchableOpacity
      style={styles.workoutItem}
      onPress={() => navigation.navigate("HomeScreen", { workout: item })} // Передаем workout как параметр
      onLongPress={() => handleLongPress(item.id)}
    >
      <Text style={styles.workoutName}>{item.workoutName}</Text>
      <Text style={styles.exerciseNames}>
        {item.exercises.map((exercise) => exercise.name).join(", ")}
      </Text>
      <TouchableOpacity onPress={() => handleStartWorkout(item.id)}>
        <Text style={styles.startButton}>Start</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Workouts</Text>
        <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
          <Ionicons name="add-circle-outline" size={32} color="#A0716C" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={workouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No workouts found. Tap + to add a new one.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  workoutItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  workoutName: {
    fontSize: 18,
  },
  exerciseNames: {
    color: "gray",
    fontSize: 12,
  },
  startButton: {
    color: "green",
    fontSize: 16,
    marginTop: 10,
  },
});

export default MyPlanScreen;
