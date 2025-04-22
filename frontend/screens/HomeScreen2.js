import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreenNavigator from "../navigation/HomeScreenNavigator";

const HomeScreen2 = ({ navigation }) => {
  const [user, setUser] = useState(null);
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
    await AsyncStorage.removeItem("user");
    setUser(null);
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
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

      {/* Menu */}
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

      {/* Content - Navigator */}
      <HomeScreenNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
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
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default HomeScreen2;
