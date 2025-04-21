import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../backend/config";
import { auth } from "../backend/config";
import { useFocusEffect } from "@react-navigation/native";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  const [allWorkouts, setAllWorkouts] = useState([]); // Store all workouts
  const [filteredWorkouts, setFilteredWorkouts] = useState([]); // Store workouts for the selected date
  const [loading, setLoading] = useState(false);
  const { currentUser } = auth;

  useFocusEffect(
    React.useCallback(() => {
      fetchAllWorkouts();
    }, [])
  );

  useEffect(() => {
    // Filter workouts when a date is selected
    if (selectedDate) {
      const filtered = allWorkouts.filter((workout) => {
        const workoutDate = new Date(workout.createdAt.seconds * 1000).toISOString().split("T")[0];
        return workoutDate === selectedDate;
      });
      setFilteredWorkouts(filtered);
    }
  }, [selectedDate, allWorkouts]);

  async function fetchAllWorkouts() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "workouts"), // Ensure you're querying the correct collection
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllWorkouts(workouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {/* Calendar */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "tomato" },
        }}
        theme={{
          todayTextColor: "red",
          arrowColor: "tomato",
        }}
      />

      {/* Show exercises for selected day */}
      <View style={styles.workoutContainer}>
        <Text style={styles.dateText}>
          {selectedDate ? `Workouts on ${selectedDate}:` : "Pick a date"}
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="tomato" />
        ) : filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout, index) => (
            <View key={index} style={styles.workoutItem}>
              <Text style={styles.workoutText}>
                {workout.workoutName || "Unnamed Workout"}
              </Text>
              {workout.exercises.map((exercise, i) => (
                <Text key={i} style={styles.exerciseText}>
                  {exercise.name} - {exercise.sets}x{exercise.reps} {exercise.weight}kg
                </Text>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.workoutText}>No workouts for this date</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  workoutContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  workoutItem: {
    marginBottom: 10,
    alignItems: "center",
  },
  workoutText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  exerciseText: {
    fontSize: 14,
    textAlign: "center",
  },
});
