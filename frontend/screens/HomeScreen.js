import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
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
        setUser(null); 
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    await AsyncStorage.removeItem("user");
    setUser(null); 
    navigation.replace("Login");
  };

  const handleExerciseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
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

          <ExerciseForm userId={user.uid} onExerciseAdded={handleExerciseAdded} />
          <View style={styles.listContainer}>
            <ExerciseList userId={user.uid} key={refreshTrigger} />
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
