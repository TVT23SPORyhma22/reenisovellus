import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../backend/config";
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { FontAwesome } from "@expo/vector-icons";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);

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

  const showPasswordPrompt = () => {
    Alert.prompt(
      "Confirm Password",
      "Enter your password to delete your account",
      async (password) => {
        if (!password) {
          Alert.alert("Error", "Password cannot be empty.");
          return;
        }

        const user = auth.currentUser;
        if (!user || !user.email) {
          Alert.alert("Error", "User not authenticated.");
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, password);

        try {
          await reauthenticateWithCredential(user, credential);
          await deleteUser(user);
          await AsyncStorage.removeItem("user");
          navigation.replace("Login");
          Alert.alert("Success", "Account deleted successfully.");
        } catch (error) {
          Alert.alert("Error", error.message);
        }
      },
      "secure-text"
    );
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;

    Alert.alert(
      "Delete Account",
      "For security reasons, please enter your password to delete your account.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: () => showPasswordPrompt() }
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser || newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert("Success", "Password updated successfully.");
      setNewPassword("");
      setShowPasswordChange(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="chevron-left" size={30} color="black" style={styles.arrowIcon} />
      </TouchableOpacity>

      <View style={styles.optionsContainer}>
        <View style={styles.optionContainer}>
          <Text style={styles.optionTitle}>Email</Text>
          <Text style={styles.optionValue}>{user?.email}</Text>
        </View>

        <TouchableOpacity style={styles.option} onPress={() => setShowPasswordChange(!showPasswordChange)}>
          <Text style={styles.optionText}>Change Password</Text>
          <FontAwesome name="chevron-right" size={18} color="gray" style={styles.arrowIcon} />
        </TouchableOpacity>

        {showPasswordChange && (
          <View style={styles.changePasswordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
              <Text style={styles.changePasswordText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("UnitsOfMeasure")}>
          <Text style={styles.optionText}>Units of Measure</Text>
          <FontAwesome name="chevron-right" size={18} color="gray" style={styles.arrowIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("CountryRegion")}>
          <Text style={styles.optionText}>Country/Region</Text>
          <FontAwesome name="chevron-right" size={18} color="gray" style={styles.arrowIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("PrivacyPolicy")}>
          <Text style={styles.optionText}>Privacy Policy</Text>
          <FontAwesome name="chevron-right" size={18} color="gray" style={styles.arrowIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 50,  
    left: 10,
    padding: 10,
  },
  arrowIcon: {
    marginLeft: "auto", 
  },
  optionsContainer: {
    marginTop: 80,  
    padding: 20,
  },
  optionContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  optionValue: {
    fontSize: 16,
    color: "gray",
  },
  changePasswordContainer: {
    paddingVertical: 15,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  changePasswordButton: {
    backgroundColor: "#A0716C",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  changePasswordText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
  },
  deleteText: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
  logoutOption: {
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default SettingsScreen;
