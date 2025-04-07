import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../backend/config";
import { signOut } from "firebase/auth";
import { Picker } from "@react-native-picker/picker";
import { fetchExerciseTranslations } from "../components/translations";
import ExercisePicker from "../components/ExercisePicker";
import ExercisesList from "../components/ExercisesList";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";

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
    setUser(null);
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
    <ScrollView style={styles.container}>
      {user ? (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Image
                source={user?.photoURL ? { uri: user.photoURL } : require("../assets/default-profile.png")}
                style={styles.profilePhoto}
              />
            </TouchableOpacity>
            <Text style={styles.welcomeText}>Welcome, {user?.email}</Text>
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <Entypo name="menu" size={30} color="black" />
            </TouchableOpacity>
          </View>

          {menuVisible && (
            <View style={styles.menu}>
              <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.menuButton}>
                <Text style={styles.menuText}>My Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.menuButton}>
                <Text style={styles.menuText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )}

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

          <View style={styles.exerciseListContainer}>
            <ExercisesList
              exercises={exerciseList}
              translations={exerciseTranslations}
              onDelete={deleteExercises}
            />
          </View>
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
});

export default HomeScreen;
