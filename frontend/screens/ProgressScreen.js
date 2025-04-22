import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Modal, ActivityIndicator, ScrollView, Pressable, TextInput } from "react-native";
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
  const [exerciseDates, setExerciseDates] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [editingWeight, setEditingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState(null);
  const [streakGoal, setStreakGoal] = useState(7);
  const [newGoalInput, setNewGoalInput] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);


  // laskee treenipäivien peräkkäisyyden
  // streak = peräkkäiset treenipäivät
  const calculateStreak = (exerciseDates) => {
    if (exerciseDates.length === 0) return 0;
  
    // päivämäärät millisekunteina
    const MS_IN_DAY = 86400000;
  
    // nollaa päivämäärä
    const normalizedTimestamps = exerciseDates.map(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });
  
    const uniqueDates = [...new Set(normalizedTimestamps)].sort((a, b) => b - a);
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentDay = today.getTime();
  
    // jos tänään ei ole treenipäivä, aloitetaan eilisestä
    if (!uniqueDates.includes(currentDay)) {
      currentDay -= MS_IN_DAY;
    }
  
    let streak = 0;
    let i = 0;
  
    // laske taaksepäin nykyisestä päivästä kunnes löydetään päivä joka ei ole treenipäivä
    while (uniqueDates.includes(currentDay)) {
      streak++;
      currentDay -= MS_IN_DAY;
    }
  
    return streak;
  };
  
  
  // kalenteri, joka näyttää päivät pisteinä
  const CompactCalendar = ({ month, year, workoutDates }) => {

    
    const getDaysInMonth = (month, year) => {
      return new Date(year, month + 1, 0).getDate();
    };
  
    const getFirstDayOfMonth = (month, year) => {
      // hakee viikon ensimmäisen päivän (0 = sunnuntai, 1 = maanantai, ..., 6 = lauantai)
      const firstDay = new Date(year, month, 1).getDay();
      // muuttaa maanantaista alkaen (0 = maanantai, 1 = tiistai, ..., 6 = sunnuntai)
      return firstDay === 0 ? 6 : firstDay - 1;
    };
  
    const renderCalendarDots = () => {
      const days = getDaysInMonth(month, year);
      const firstDay = getFirstDayOfMonth(month, year);
      const dots = [];
  
      // lisää tyhjää tilaa kuukauden alkuun
      for (let i = 0; i < firstDay; i++) {
        dots.push(
          <View key={`empty-${i}`} style={styles.calendarDot}>
            <View style={styles.emptyDot} />
          </View>
        );
      }
  
      // lisää pisteet kuun jokaiselle päivälle
      for (let day = 1; day <= days; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toLocaleDateString("en-CA");
        const isWorkoutDay = workoutDates[dateString];
          
        dots.push(
          <View key={`day-${day}`} style={styles.calendarDot}>
            <View style={[
              styles.dot, 
              isWorkoutDay ? styles.workoutDot : styles.regularDot,
              date.toDateString() === new Date().toDateString() ? styles.todayDot : null
            ]} />
          </View>
        );
      }
      
  // lisää tyhjää tilaa kuukauden loppuun
  const totalCells = firstDay + days; // kaikkien solujen määrä
  const remainingSlots = 7 - (totalCells % 7); // tyhjien solujen määrä

  if (remainingSlots < 7) { // lisää vain jos viikko jää kesken
    for (let i = 0; i < remainingSlots; i++) {
      dots.push(
        <View key={`end-empty-${i}`} style={styles.calendarDot}>
          <View style={styles.emptyDot} />
        </View>
      );
    }
  } 
      return dots;
    };

    return (
      <View style={styles.compactCalendarContainer}>
        <Text style={styles.compactMonthTitle}>
          {new Date(year, month).toLocaleString('default', { month: 'short' })}
        </Text>
        <View style={styles.dotsContainer}>
          {renderCalendarDots()}
        </View>
      </View>
    );
  };
  
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

  // hakee käyttäjän tavoitteen tietokannasta
  useEffect(() => {
    const fetchGoal = async () => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.streakGoal) {
          setStreakGoal(data.streakGoal);
        }
      }
    };
  
    if (userId) fetchGoal();
  }, [userId]);

  // tallentaa käyttäjän tavoitteen tietokantaan
  const updateStreakGoal = async () => {
    const parsedGoal = parseInt(newGoalInput);
    if (isNaN(parsedGoal) || parsedGoal < 1) return;
  
    await updateDoc(doc(db, 'users', userId), {
      streakGoal: parsedGoal,
    });
  
    setStreakGoal(parsedGoal);
    setShowGoalModal(false);
    setNewGoalInput('');
  };
  
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      const fetchWorkoutData = async () => {
        try {
          setLoading(true);

          // Fetch data from the last three months for the calendar and streak
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          const threeMonthsAgoTimestamp = Timestamp.fromDate(threeMonthsAgo);

          // Fetch data from the last week for volume calculation
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          sevenDaysAgo.setHours(0, 0, 0, 0); // Reset time
          const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

          const workoutsRef = collection(db, "workouts");
          const q = query(
            workoutsRef,
            where("userId", "==", userId),
            where("completed", "==", true) // Fetch only completed workouts
          );

          const querySnapshot = await getDocs(q);
          let totalVolume = 0;
          let workoutSessions = new Set();
          const markedDates = {};
          const exerciseDates = [];

          querySnapshot.forEach((doc) => {
            const { exercises, completionDates } = doc.data();

            // Process each date in the completionDates array
            if (completionDates && Array.isArray(completionDates)) {
              completionDates.forEach((dateString) => {
                const workoutDate = new Date(dateString);
                const normalizedDate = workoutDate.toLocaleDateString("en-CA");

                // Mark the date for the calendar
                markedDates[normalizedDate] = true;
                exerciseDates.push(normalizedDate);

                // Calculate volume for the last week
                if (workoutDate >= sevenDaysAgo) {
                  exercises.forEach((exercise) => {
                    totalVolume +=
                      (Number(exercise.sets) || 0) *
                      (Number(exercise.reps) || 0) *
                      (Number(exercise.weight) || 0);
                  });
                }

                // Add the date to the workout sessions
                workoutSessions.add(normalizedDate);
              });
            }
          });

          // Calculate streak
          const streakCount = calculateStreak(exerciseDates);

          setCurrentStreak(streakCount);
          setExerciseDates(markedDates);
          setVolumeLifted(totalVolume);
          setWorkoutCount(workoutSessions.size);
        } catch (err) {
          console.error("Error fetching progress data:", err);
        } finally {
          setLoading(false);
        }
      };

      // Fetch user stats (e.g., calories burned, weight)
      const fetchUserStats = async () => {
        try {
          const userStatsRef = doc(db, "users", userId);
          const userStatsSnap = await getDoc(userStatsRef);

          if (userStatsSnap.exists()) {
            const { caloriesBurned, weight } = userStatsSnap.data();
            setCaloriesBurned(caloriesBurned || "-"); // Default to "-" if no data
            setBodyWeight(weight);
          } else {
            setCaloriesBurned("-");
            setBodyWeight("-");
          }
        } catch (error) {
          console.error("Error fetching user stats:", error);
        }
      };

      fetchWorkoutData();
      fetchUserStats();
    }, [userId])
  );

  // hakee kolme kuukautta taaksepäin nykyisen kuukauden mukaan lukien
  const getThreeConsecutiveMonths = () => {
    // hakee nykyisen päivämäärän
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // luo tyhjän taulukon kuukausille
    const months = [];
    // lisää nykyisen kuukauden ja kaksi edellistä kuukautta
    for (let i = 0; i < 3; i++) {
      // kuukausi lasketaan 0-11, joten pitää vähentää i
      let monthIndex = currentMonth - i;
      let year = currentYear;
      // jos kuukausi on negatiivinen, vähennetään vuotta
      if (monthIndex < 0) {
        monthIndex += 12;
        year -= 1;
      }
      
      months.push({
        month: monthIndex,
        year: year
      });
    }
    // käännetään taulukko, jotta nykyinen kuukausi on ensimmäisenä
    return months.reverse();
  };

  const threeMonths = getThreeConsecutiveMonths();

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
                    style={styles.value}
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
            <View style={styles.streakContainer}>
              <View style={styles.compactCalendarRow}>
                {threeMonths.map((data, index) => (
                  <CompactCalendar 
                    key={index} 
                    month={data.month} 
                    year={data.year} 
                    workoutDates={exerciseDates} 
                  />
                ))}
              </View>

              <View style={styles.streakBarContainer}>
                <View style={styles.streakBar}>
                <View style={[styles.streakProgress, { width: `${Math.min((currentStreak / streakGoal) * 100, 100)}%` }]} />
                </View>
                <Pressable onPress={() => setShowGoalModal(true)} style={styles.streakTextContainer}>
                  <Text style={styles.streakText}>
                  {currentStreak} / {streakGoal} streak
                  </Text>
                  <Text style={styles.streakEditHint}>(Tap to edit)</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.boxWide}>
            <Text style={styles.label}>Total Volume lifted (Last 7 Days)</Text>
            <Text style={styles.value}>{volumeLifted} kg</Text>
          </View>

          <Modal
            transparent
            visible={showGoalModal}
            animationType="fade"
            onRequestClose={() => setShowGoalModal(false)}
          >
      <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Edit Streak Goal</Text>

          <TextInput
          style={styles.modalInput}
          value={newGoalInput}
          onChangeText={setNewGoalInput}
          placeholder="Enter new streak goal"
          keyboardType="numeric"
          placeholderTextColor="grey"
          />

      <View style={styles.modalButtons}>
          <Pressable style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setShowGoalModal(false)}>
          <Text style={[styles.modalButtonText, styles.modalCancelText]}>Cancel</Text>
        </Pressable>
          <Pressable style={styles.modalButton} onPress={updateStreakGoal}>
          <Text style={styles.modalButtonText}>Save</Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>

        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 20,
    paddingBottom: 80,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  boxLarge: {
    width: "45%",
    aspectRatio: 1.2,
    padding: 15,
    backgroundColor: "#F1EFEC",
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 15,
  },
  boxWide: {
    width: "100%",
    padding: 15,
    backgroundColor: "#F1EFEC",
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
    color: "black",
  },

  value: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  // kalenterin tyylit
  compactCalendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  compactCalendarContainer: {
    width: '30%',
  },
  compactMonthTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  calendarDot: {
    width: '14.28%', // 7 pistettä per rivi (100% / 7)
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyDot: {
    width: 6,
    height: 6,
    opacity: 0,
  },
  regularDot: {
    backgroundColor: '#ccc',
  },
  workoutDot: {
    backgroundColor: '#FF9B17',
  },
  todayDot: {
    backgroundColor: '#F16767',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // streak baari 
  streakBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  streakBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  streakProgress: {
    height: '100%',
    backgroundColor: '#FCB454',
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
  
  streakContainer: {
    width: '100%',
    alignItems: 'center',
  },
// streak tekstin container
  streakTextContainer: {
    alignItems: 'center',
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  streakEditHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },
  streakEditHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  // streakin muokkaus ikkuna
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  }, 
  modalButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'grey',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCancelText: {
    color: '#fff',
  },
});

export default ProgressScreen;