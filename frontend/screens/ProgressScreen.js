import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { collection, doc, query, where, getDocs, getDoc } from "firebase/firestore";
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

  // laskee treenipäivien peräkkäisyyden
  // streak = peräkkäiset treenipäivät
  const calculateStreak = (exerciseDates) => {
    if (exerciseDates.length === 0) return 0;
  
    // poimitaan vain päivämäärät ilman aikaa
    const uniqueDates = [...new Set(exerciseDates.map(date => date.toDateString()))];
  
    // järjestetään päivämäärät laskevasti
    const sortedDates = uniqueDates.sort((a, b) => new Date(b) - new Date(a));
  
    // luo tämän päivän ilman aikaa
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // luo eilisen päivän ilman aikaa
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // tarkistaa onko tänään treenattu
    const todayExercised = sortedDates.some(date => 
      new Date(date).toDateString() === today.toDateString()
    );
    
    // tarkistaa onko eilen treenattu
    const yesterdayExercised = sortedDates.some(date => 
      new Date(date).toDateString() === yesterday.toDateString()
    );
  
    // jos tänään on treenattu, aloita streakin laskeminen tästä päivästä
    // jos ei ole treenattu tänään, mutta eilen on, aloita streakin laskeminen eilisestä
    let currentDate = todayExercised ? today : yesterdayExercised ? yesterday : null;
    
    // jos ei ole treenattu tänään eikä eilen, streak on 0
    if (!currentDate) return 0;
    
    let streak = todayExercised ? 1 : 0; // aloita 1:stä jos tänään on treenattu, muuten 0
    
    if (yesterdayExercised) streak++; // lisää streak jos eilen treenattiin
    
    // käy läpi aiemmat päivät
    for (let i = 0; i < sortedDates.length; i++) {
      const exerciseDate = new Date(sortedDates[i]);
      exerciseDate.setHours(0, 0, 0, 0);
      
      // jos käsittelemme jo tämän päivän tai eilisen, ohita se
      if (exerciseDate.getTime() === today.getTime() || 
          exerciseDate.getTime() === yesterday.getTime()) {
        continue;
      }
      
      // laskee päivien eron nykyisestä päivästä
      const daysDifference = Math.floor(
        (currentDate.getTime() - exerciseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // jos ero on tasan 1 päivä, lisää streakia ja päivitä nykyinen päivä
      if (daysDifference === 1) {
        streak++;
        currentDate = exerciseDate;
      } else if (daysDifference > 1) {
        // jos ero on enemmän kuin 1 päivä, streak katkeaa
        break;
      }
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

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      
      const fetchExerciseData = async () => {
        try {
          setLoading(true);
          
          // hakee kolmen kuukauden datan kalenteria ja streakia varten
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          const threeMonthsAgoTimestamp = Timestamp.fromDate(threeMonthsAgo);
      
          // hakee viikon datan volyymia varten
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          sevenDaysAgo.setHours(0, 0, 0, 0); // nollaa aika
          const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);
      
          const exercisesRef = collection(db, "exercises");
          const q = query(
            exercisesRef,
            where("userId", "==", userId),
            where("createdAt", ">=", threeMonthsAgoTimestamp)
          );
      
          const querySnapshot = await getDocs(q);
          let totalVolume = 0;
          let workoutSessions = new Set();
          const markedDates = {};
          const exerciseDates = [];
      
          querySnapshot.forEach((doc) => {
            const { sets, reps, weight, createdAt } = doc.data();
            const exerciseDate = createdAt.toDate();
            const dateString = exerciseDate.toLocaleDateString("en-CA");
            
            // laskee volyymin viimeisen viikon ajalta
            if (exerciseDate >= sevenDaysAgo) {
              totalVolume += (Number(sets) || 0) * (Number(reps) || 0) * (Number(weight) || 0);
            }
            
            // 3 kuukauden datan käsittely
            workoutSessions.add(dateString);
            markedDates[dateString] = true;
            exerciseDates.push(exerciseDate);
          });
      
          // laskee peräkkäiset treenipäivät
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
      
      // hakee käyttäjän dataa esim, userStats collectionista
      const fetchUserStats = async () => {
        try {
          const userStatsRef = doc(db, "userStats", userId);
          const userStatsSnap = await getDoc(userStatsRef);

          if (userStatsSnap.exists()) {
            const { caloriesBurned, bodyWeight } = userStatsSnap.data();
            setCaloriesBurned(caloriesBurned || "-"); // jos kyseistä dataa ei ole, tietokanta antaa - 
            setBodyWeight(bodyWeight || "-");
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

          <View style={styles.boxLarge}>
            <Text style={styles.label}>Body Weight</Text>
            <Text style={styles.value}>{bodyWeight} kg</Text>
          </View>

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
                  <View style={[styles.streakProgress, { width: `${Math.min(currentStreak * 10, 100)}%` }]} />
                </View>
                <Text style={styles.streakText}>{currentStreak} {currentStreak === 1 ? 'streak' : 'streaks'}</Text>
              </View>
            </View>
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

  streakContainer: {
    width: '100%',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
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
});

export default ProgressScreen;