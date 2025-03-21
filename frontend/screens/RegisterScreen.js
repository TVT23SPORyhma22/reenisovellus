
// rekisteröinti, ei käyttäjälle
import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "../backend/config"; 

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.replace("Main");
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again.";

      // virheilmoitus jos osoite jo käytössä
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
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
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      {error ? <Text>{error}</Text> : null}
      <Button title="Register" onPress={handleRegister} />
      <Button title="Back to Login" onPress={() => navigation.navigate("Login")} />
    </View>
  );
};

export default RegisterScreen;
