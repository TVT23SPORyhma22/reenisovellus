
// rekisteröinti, ei käyttäjälle
import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../backend/config"; 
import { collection, doc, setDoc } from "firebase/firestore";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // käyttäjätiedot tallennetaan Firestoreen
      await setDoc(doc(db, "users", user.uid), {
        userId: user.uid,
        email: user.email,
        weight: "-"
      });

      // rekisteröinti onnistui

      alert("Registration successful! You can now log in.");

      // navigoi kirjautumissivulle rekisteröinnin jälkeen
      navigation.replace("Login");
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
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button title="Register" onPress={handleRegister} />
        <Button title="Back to Login" onPress={() => navigation.navigate("Login")} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  innerContainer: {
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default RegisterScreen;