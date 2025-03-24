import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../backend/config"; // Если используете Firebase для аутентификации
import { signOut } from "firebase/auth"; // Для выхода

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account?",
      [
        { text: "Cancel" },
        { text: "Delete", onPress: () => { /* Add account deletion logic here */ } }
      ]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword"); // Переход к экрану смены пароля
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.optionContainer}>
        <Text style={styles.optionTitle}>Email:</Text>
        <Text style={styles.optionValue}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.option} onPress={handleChangePassword}>
        <Text style={styles.optionText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("UnitsOfMeasure")}>
        <Text style={styles.optionText}>Units of Measure</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("CountryRegion")}>
        <Text style={styles.optionText}>Country/Region</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("PrivacyPolicy")}>
        <Text style={styles.optionText}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleDeleteAccount}>
        <Text style={styles.optionText}>Delete Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleLogout}>
        <Text style={styles.optionText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  optionContainer: {
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  optionValue: {
    fontSize: 16,
    color: "gray",
    marginBottom: 10,
  },
  option: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    marginVertical: 5,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SettingsScreen;
