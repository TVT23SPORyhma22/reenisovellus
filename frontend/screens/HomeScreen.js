import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../backend/config"; 
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import ExerciseForm from "../components/ExerciseForm";
import ExerciseList from "../components/ExerciseList";
import { Entypo } from "@expo/vector-icons";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);

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

  const handleLogout = async () => {
    await signOut(auth);
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  };

  const handleExerciseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
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
        </View>
      )}

      {user && (
        <>
          <ExerciseForm userId={user.uid} onExerciseAdded={handleExerciseAdded} />
          <View style={styles.listContainer}>
            <ExerciseList userId={user.uid} key={refreshTrigger} />
          </View>
        </>
      )}
    </View>
  );
};

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
  listContainer: {
    flex: 1,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    alignItems: "flex-end", 
    justifyContent: "flex-start",
    zIndex: 999, 
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
});

export default HomeScreen;
