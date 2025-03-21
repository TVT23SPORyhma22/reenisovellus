import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";

// Data example
const workoutData = {
  "2025-03-18": "Penkkipunnerrus 4x6-8 70kg, Vinopenkki 4x8-10 15kg",
  "2025-03-19": "Leuanveto 4x6-8, Kulmasoutu 4x8-10 50kg",
  "2025-03-20": "Vinopenkki tanko 4x6-8 40kg, Dipit 3x10-12",
  "2025-03-21": "T-soutu 4x8-10, Kapea ylätalja 3x10-12 50kg",
};

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  
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
        <Text style={styles.workoutText}>
          {selectedDate && workoutData[selectedDate]
            ? workoutData[selectedDate]
            : "No data"}
        </Text>
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
