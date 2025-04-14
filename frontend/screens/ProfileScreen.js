import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("Loaded user from storage:", parsedUser);  // Отладочное сообщение
          setUser(parsedUser);
          setProfilePhoto(parsedUser.photoURL);
        } else {
          navigation.replace("Login");
        }
      } catch (error) {
        console.error("Error loading user from AsyncStorage:", error);  // Обработка ошибок
      }
    };
    loadUser();
  }, []);

  const changeProfilePhoto = () => {
    Alert.alert(
      "Change Profile Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: () => pickImage("camera") },
        { text: "Choose from Gallery", onPress: () => pickImage("gallery") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const pickImage = async (source) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "You need to grant permission to use this feature.");
      return;
    }

    let result;
    if (source === "camera") {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== "granted") {
        Alert.alert("Permission Denied", "You need to grant camera access.");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });
    }

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
      savePhotoToStorage(result.assets[0].uri);
    }
  };

  const savePhotoToStorage = async (photoUri) => {
    if (user) {
      const updatedUser = { ...user, photoURL: photoUri };
      console.log("Saving photo to storage:", updatedUser);  // Отладочное сообщение
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Main')} >
        <FontAwesome name="chevron-left" size={30} color="black" style={styles.arrowIcon} />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <TouchableOpacity onLongPress={changeProfilePhoto}>
          <Image 
            source={profilePhoto ? { uri: profilePhoto } : require("../assets/default-profile.png")}
            style={styles.profilePhoto}
          />
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.email}</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => Alert.alert("QR Scanner will open here.")}> 
            <FontAwesome name="qrcode" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}> 
            <FontAwesome name="cog" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("MeasurementHistory")}>
          <Text style={styles.menuText}>BODY MEASUREMENT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Membership")}>
          <Text style={styles.menuText}>MEMBERSHIP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Friends")}>
          <Text style={styles.menuText}>FRIENDS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 50,  
    left: 10,
    padding: 10,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  userName: {
    fontSize: 30,
    fontWeight: "italic",
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 170,
    marginTop: 40,
  },
  menuContainer: {
    width: "100%",
    marginTop: 150,
  },
  menuItem: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    marginVertical: 5,
    borderRadius: 5,
    alignItems: "left",
  },
  menuText: {
    fontSize: 25,
    fontWeight: "semi bold",
  },
});

export default ProfileScreen;
