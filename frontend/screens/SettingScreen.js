import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../backend/config"; 
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"; 

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");

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

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;

    Alert.alert(
      "Delete Account",
      "For security reasons, please enter your password to delete your account.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Continue",
          onPress: () => showPasswordPrompt()
        }
      ]
    );
  };

  const showPasswordPrompt = () => {
    Alert.prompt(
      "Re-authenticate",
      "Enter your password to confirm account deletion.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: (password) => reauthenticateAndDelete(password) }
      ],
      "secure-text"
    );
  };

  const reauthenticateAndDelete = async (password) => {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);

    try {
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      await AsyncStorage.removeItem("user");
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.optionContainer}>
        <Text style={styles.optionTitle}>Email:</Text>
        <Text style={styles.optionValue}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("ChangePassword")}>
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

      <TouchableOpacity style={styles.deleteOption} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
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
  deleteOption: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    marginVertical: 5,
    borderRadius: 5,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
  },
});

export default SettingsScreen;
