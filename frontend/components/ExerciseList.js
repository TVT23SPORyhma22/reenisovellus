import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../backend/config";

const ExerciseItem = ({ item }) => {
  return (
    <View style={styles.exerciseItem}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <View style={styles.exerciseDetails}>
        <Text>{item.sets} sets</Text>
        <Text>{item.reps} reps</Text>
        {item.weight > 0 && <Text>{item.weight} kg</Text>}
      </View>
    </View>
  );
};

const ExerciseList = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const exercisesRef = collection(db, "exercises");
        const q = query(
          exercisesRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const exerciseList = [];

        querySnapshot.forEach((doc) => {
          exerciseList.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
          });
        });

        setExercises(exerciseList);
      } catch (err) {
        console.error("Error fetching exercises:", err);
        setError("Failed to load exercises");
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [userId]);

  if (loading || userId === null) {
    return <ActivityIndicator size="large" color="pink" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (exercises.length === 0) {
    return <Text style={styles.emptyText}>No added exercises!</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Exercises</Text>
      <FlatList
        data={exercises}
        renderItem={({ item }) => <ExerciseItem item={item} />}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  exerciseItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "darkblue",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  exerciseDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default ExerciseList;
