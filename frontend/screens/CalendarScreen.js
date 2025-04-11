import React, { use, useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../backend/config";
import { auth } from "../backend/config"; 


export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = auth;

  useEffect(() => {
    if (selectedDate) {
      fetchWorkouts(selectedDate);
    }
  }, [selectedDate]);

  async function fetchWorkouts(date) {
    setLoading(true);
    try {
      const selectedTimestamp = Timestamp.fromDate(new Date(date));
      const startOfDay = new Timestamp(selectedTimestamp.seconds, 0);
      const endOfDay = new Timestamp(selectedTimestamp.seconds + 86400, 0);

      const q = query(
        collection(db, "exercises"),
        where("userId", "==", currentUser.uid),
        where("createdAt", ">=", startOfDay),
        where("createdAt", "<", endOfDay)
      );
      const querySnapshot = await getDocs(q);
      const exercises = querySnapshot.docs.map((doc) => doc.data());
      setWorkouts(exercises);
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

      {/* Show exercise for selected day */}
      <View style={styles.workoutContainer}>
        <Text style={styles.dateText}>
          {selectedDate ? `Exercise ${selectedDate}:` : "Pick a date"}
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="tomato" />
        ) : workouts.length > 0 ? (
          workouts.map((exercise, index) => (
            <Text key={index} style={styles.workoutText}>
              {exercise.name} {exercise.sets}x{exercise.reps} {exercise.weight}kg
            </Text>
          ))
        ) : (
          <Text style={styles.workoutText}>No data</Text> 
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
  workoutText: {
    fontSize: 14,
    textAlign: "center",
  },
});
