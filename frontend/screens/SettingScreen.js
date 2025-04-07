import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from "react-native";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordForDelete, setPasswordForDelete] = useState("");

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

  const confirmDeleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    if (!passwordForDelete) {
      Alert.alert("Error", "Password cannot be empty.");
      return;
    }

    const credential = EmailAuthProvider.credential(currentUser.email, passwordForDelete);

    try {
      await reauthenticateWithCredential(currentUser, credential);
      await deleteUser(currentUser);
      await AsyncStorage.removeItem("user");
      setShowDeleteModal(false);
      navigation.replace("Login");
      Alert.alert("Success", "Account deleted successfully.");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
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


      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalMessage}>Enter your password to delete your account:</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry
              value={passwordForDelete}
              onChangeText={setPasswordForDelete}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)} style={styles.modalCancel}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDeleteAccount} style={styles.modalDelete}>
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancel: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  modalDelete: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SettingsScreen;
