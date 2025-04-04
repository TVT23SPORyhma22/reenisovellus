import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../backend/config";
import { signOut } from "firebase/auth";
import { Picker } from "@react-native-picker/picker";
import { fetchExerciseTranslations } from "../components/translations";
import ExercisePicker from "../components/ExercisePicker";
import ExercisesList from "../components/ExercisesList";

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [exerciseData, setExerciseData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [exerciseTranslations, setExerciseTranslations] = useState({});
  const [exerciseList, setExerciseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        navigation.replace("Login");
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
          const exerciseResponse = await fetch(`https://wger.de/api/v2/exercise/?category=${selectedCategory}&language=2&limit=100`);
          const exerciseData = await exerciseResponse.json();
          setExerciseData(exerciseData.results);
        }

        setExerciseTranslations(await fetchExerciseTranslations(2));
      } catch {
        setError("Failed to load data.");
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedCategory]);

  const handleLogout = async () => {
    await signOut(auth);
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  };

  const addExerciseToList = (exerciseId, sets, reps) => {
    const selectedExercise = exerciseData.find((ex) => ex.id === exerciseId);
    if (selectedExercise) {
      setExerciseList([...exerciseList, { ...selectedExercise, sets, reps }]);
    }
  };

  const deleteExercises = (selectedExerciseIds) => {
    setExerciseList(exerciseList.filter((ex) => !selectedExerciseIds.includes(ex.id)));
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <ScrollView style={styles.container}> {/* ScrollView wrapping the content */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.email}</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>

      {user && (
        <>
          <View style={styles.formBox}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="-- Select Category --" value={null} />
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.name} value={category.id} />
              ))}
            </Picker>

            <ExercisePicker
              exercises={exerciseData}
              translations={exerciseTranslations}
              onAdd={addExerciseToList}
            />
          </View>

          {/* Scrollable Exercise List */}
          <View style={styles.exerciseListContainer}>
            <ExercisesList exercises={exerciseList} translations={exerciseTranslations} onDelete={deleteExercises} />
          </View>
        </>
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
    marginBottom: 20,
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
  center: {
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
    paddingBottom: 60, // Add some space to avoid overlap with footer
  },
});

export default HomeScreen;
