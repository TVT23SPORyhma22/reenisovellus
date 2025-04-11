import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../backend/config";
import { signOut } from "firebase/auth";
import { fetchExerciseTranslations } from "../components/translations";
import ExercisePicker from "../components/ExercisePicker";
import ExercisesList from "../components/ExercisesList";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import { db } from "../backend/config"; 
import { collection, addDoc } from "firebase/firestore"; 
import { Picker } from '@react-native-picker/picker'; 

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [exerciseData, setExerciseData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [exerciseTranslations, setExerciseTranslations] = useState({});
  const [exerciseList, setExerciseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoryResponse = await fetch("https://wger.de/api/v2/exercisecategory/");
        const categoryData = await categoryResponse.json();
        setCategories(categoryData.results);

        if (selectedCategory) {
          const exerciseResponse = await fetch(
            `https://wger.de/api/v2/exercise/?category=${selectedCategory}&language=2&limit=100`
          );
          const exerciseData = await exerciseResponse.json();
          setExerciseData(exerciseData.results);
        }

        setExerciseTranslations(await fetchExerciseTranslations(2)); 
      } catch (error) {
        setError("Failed to load data.");
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedCategory]);


  const addExerciseToList = (exerciseId, sets, reps) => {
    const selectedExercise = exerciseData.find((ex) => ex.id === exerciseId);
    if (selectedExercise) {
      setExerciseList([
        ...exerciseList,
        { ...selectedExercise, sets, reps, id: `${selectedExercise.id}-${new Date().getTime()}` }
      ]);
    }
  };

  const deleteExercises = (selectedExerciseIds) => {
    setExerciseList(exerciseList.filter((ex) => !selectedExerciseIds.includes(ex.id)));
  };

  const saveWorkoutPlan = async () => {
    if (!user) {
      alert("You must be logged in to save a workout.");
      return;
    }

    try {
      const workoutDocRef = await addDoc(collection(db, "workouts"), {
        userId: user.uid, 
        workoutName: `Workout-${new Date().toLocaleDateString()}-${new Date().getTime()}`, 
        exercises: exerciseList,
        createdAt: new Date(),
      });

      console.log("Workout saved with ID: ", workoutDocRef.id);
      navigation.navigate("Main"); 
    } catch (error) {
      console.log("Error saving workout plan", error);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <ScrollView style={styles.container}>
      {user ? (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Entypo name="chevron-left" size={30} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.formBox}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="-- Select Category --" value="" />
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.name} value={category.id.toString()} />
              ))}
            </Picker>

           <ExercisePicker
             exercises={exerciseData}
             translations={exerciseTranslations}
             onAdd={addExerciseToList}
           />
         </View>

         <View style={styles.exerciseListContainer}>
           <ExercisesList
             exercises={exerciseList}
             translations={exerciseTranslations}
             onDelete={deleteExercises}
           />
         </View>

         <TouchableOpacity style={styles.saveButton} onPress={saveWorkoutPlan}>
           <Text style={styles.saveButtonText}>Save & Go Back to Main</Text>
         </TouchableOpacity>
       </>
     ) : (
       <View style={styles.centeredContainer}>
         <Text style={styles.infoText}>Please log in to see your profile and exercises.</Text>
         <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
           <Text style={styles.loginButtonText}>Go to Login</Text>
         </TouchableOpacity>
         </View>
      )}
    </ScrollView>
  );
};

const LoadingScreen = () => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color="#3498db" />
    <Text style={styles.loadingText}>Loading exercises...</Text>
  </View>
);

const ErrorScreen = ({ message }) => (
  <View style={styles.center}>
    <Text style={styles.errorText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  formBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    marginBottom: 10,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  menu: {
    position: "absolute",
    top: 75,
    right: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: 150,
    zIndex: 10,
  },
  menuButton: {
    padding: 10,
  },
  menuText: {
    fontSize: 16,
    color: "black",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#3498db",
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginTop: 10,
  },
  exerciseListContainer: {
    marginTop: 20,
    paddingBottom: 60,
  },
  infoText: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#A0716C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#A0716C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 60,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;