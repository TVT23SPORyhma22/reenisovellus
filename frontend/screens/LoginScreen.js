import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../backend/config"; 
import { SafeAreaView } from "react-native-safe-area-context";
console.log("Firebase Auth:", auth); // debugging
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        navigation.replace("Main");
      }
    };
    checkUser();
  }, []);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // tallentaa käyttäjän kirjautumisen AsyncStorageen
      await AsyncStorage.setItem("user", JSON.stringify({ email: user.email, uid: user.uid }));
  
      // tarkistaa onko users collectionia olemassa tietokannassa - jos ei ole, luo sen
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          userId: user.uid,
          email: user.email,
          weight: "-"
        });
      }
  
      navigation.replace("Main");
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again.";

      // virhe ilmoitus jos tunnus/salasana on väärin
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMessage = "The email or password you entered is incorrect.";
      } else {
        // muut Firebase Auth virheet
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = "Invalid email format. Please check your email.";
            break;
          default:
            errorMessage = error.message || "Unknown error occurred.";
        }
      }
      setError(errorMessage);
    }
  };

  return (

    <View style={styles.container}>
    <Text style={styles.title}>Welcome Back</Text>
    <Text style={styles.subtitle}>Log in to continue</Text>
      
      <TextInput 
        style={styles.input}
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
      />
      <TextInput 
        style={styles.input}
        placeholder="Password" 
        value={password} 
        secureTextEntry 
        onChangeText={setPassword} 
      />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => navigation.navigate("Register")} />
    </View>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",

    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerText: {
    marginTop: 15,
    color: "#007bff",
    fontSize: 16,



  },
});

export default LoginScreen;