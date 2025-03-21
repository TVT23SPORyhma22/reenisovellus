import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet,} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../backend/config"; 
import { signOut } from "firebase/auth";

import ExerciseForm from "../components/ExerciseForm";
import ExerciseList from "../components/ExerciseList";

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // uloskirjautuminen
  const handleLogout = async () => {
    await signOut(auth);
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  };

  // päivittää harjoituslistaan uuden
  const handleExerciseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };


  return (
<View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.welcomeText}>Welcome, {user?.email}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
      {user && (
        <>
          <ExerciseForm 
            userId={user.uid} 
            onExerciseAdded={handleExerciseAdded} 
          />
          <View style={styles.listContainer}>
            <ExerciseList 
              userId={user.uid} 
              key={refreshTrigger} 
            />
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
    marginBottom: 20,
  },
  listContainer: {
    flex: 1,
  },
  logoutContainer: {
    marginTop: 10,
    paddingVertical: 10,
  }
});

export default HomeScreen;