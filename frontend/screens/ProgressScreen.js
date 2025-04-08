import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable, TextInput } from "react-native";
import { collection, doc, query, where, getDocs, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../backend/config";
import { getAuth } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
// päivittää screenin datan kun progressscreen aukaistaan uudelleen
import { useFocusEffect } from "@react-navigation/native";

const ProgressScreen = () => {
  const [volumeLifted, setVolumeLifted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(null);
  const [bodyWeight, setBodyWeight] = useState(null);
  const [editingWeight, setEditingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState(null);

  useEffect(() => {
    const fetchUser = () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    };
    fetchUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      
      const fetchExerciseData = async () => {
        try {
          setLoading(true);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const firestoreTimestamp = Timestamp.fromDate(sevenDaysAgo);

          const exercisesRef = collection(db, "exercises");
          const q = query(
            exercisesRef,
            where("userId", "==", userId),
            where("createdAt", ">=", firestoreTimestamp)
          );

          const querySnapshot = await getDocs(q);
          let totalVolume = 0;
          let workoutSessions = new Set();

          querySnapshot.forEach((doc) => {
            const { sets, reps, weight, createdAt } = doc.data();
            totalVolume += (Number(sets) || 0) * (Number(reps) || 0) * (Number(weight) || 0);
            workoutSessions.add(createdAt.toDate().toDateString());
          });

          setVolumeLifted(totalVolume);
          setWorkoutCount(workoutSessions.size);
        } catch (err) {
          console.error("Error fetching progress data:", err);
        } finally {
          setLoading(false);
        }
      };
      
      // hakee käyttäjän dataa esim, userStats collectionista
      const fetchUserStats = async () => {
        try {
          const userStatsRef = doc(db, "users", userId);
          const userStatsSnap = await getDoc(userStatsRef);

          if (userStatsSnap.exists()) {
            const { caloriesBurned, weight } = userStatsSnap.data();
            setCaloriesBurned(caloriesBurned || "-"); // jos kyseistä dataa ei ole, tietokanta antaa - 
            setBodyWeight(weight);
          } else {
            setCaloriesBurned("-");
            setBodyWeight("-");
          }
        } catch (error) {
          console.error("Error fetching user stats:", error);
        }
      };

      fetchExerciseData();
      fetchUserStats();
    }, [userId])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!userId ? (
        <Text style={styles.errorText}>No user found.</Text>
      ) : loading ? (
        <ActivityIndicator size="large" color="pink" />
      ) : (
        <View style={styles.gridContainer}>
          <View style={styles.boxLarge}>
            <Text style={styles.label}>Kcal</Text>
            <Text style={styles.value}>{caloriesBurned} kcal</Text>
          </View>

          <Pressable
            style={styles.boxLarge}
            onPress={() => {
              setNewWeight(bodyWeight.toString());
              setEditingWeight(true);
            }}
            >
              {!editingWeight ? (
                <>
                <Text style={styles.label}>Body Weight</Text>
                <Text style={styles.value}>{bodyWeight} kg</Text>
                </>
                ): (
                  <TextInput
                    style={styles.input}
                    value={newWeight}
                    onChangeText={setNewWeight}
                    keyboardType="numeric"
                    autoFocus
                    onBlur={async () => {
                      const parsed = parseFloat(newWeight);
                      if (!isNaN(parsed)) {
                        setBodyWeight(parsed);
                        setEditingWeight(false);

                        try {
                          const userStatsRef = doc(db, "users", userId);
                          await updateDoc(userStatsRef, {
                            weight: parsed});
                        } catch (error) {
                          console.error("Error updating body weight:", error);
                        }
                      } else {
                        setEditingWeight(false);
                      }
                    }}
                  />
                )}
          </Pressable>

          <View style={styles.boxWide}>
            <Text style={styles.label}>Monthly Progress</Text>
            <Text style={styles.value}>-</Text>
          </View>

          <View style={styles.boxWide}>
            <Text style={styles.label}>Total Volume lifted (Last 7 Days)</Text>
            <Text style={styles.value}>{volumeLifted} kg</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  boxLarge: {
    width: 160,
    height: 130,
    padding: 15,
    backgroundColor: "lightgrey",
    borderRadius: 20,
    alignItems: "center",
  },
  boxWide: {
    width: 340,
    height: 120,
    padding: 15,
    backgroundColor: "lightgrey",
    borderRadius: 20,
    alignItems: "center",
  },

  label: {
    fontSize: 16,
    color: "black",
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    height: 40,
    borderColor: "#888",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    textAlign: "center",
    fontSize: 20,
    width: 100,
    backgroundColor: "white",
  },
});

export default ProgressScreen;
