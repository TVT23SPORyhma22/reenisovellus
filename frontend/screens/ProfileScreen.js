import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const ProfileScreen = () => {
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

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image 
          source={user?.photoURL ? { uri: user.photoURL } : require("../assets/default-profile.png")}
          style={styles.profilePhoto}
        />
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
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("BodyMeasurement")}>
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
  profileContainer: {
    alignItems: "center",
    marginBottom: 50,  
    
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 120,
    marginTop: 10,
  },
  menuContainer: {
    width: "100%",
    marginTop: 20,
  },
  menuItem: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    marginVertical: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
