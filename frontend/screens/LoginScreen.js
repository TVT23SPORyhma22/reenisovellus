import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../backend/config"; 

console.log("Firebase Auth:", auth); // debugging

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
    <View>
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
      />
      <TextInput 
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

export default LoginScreen;