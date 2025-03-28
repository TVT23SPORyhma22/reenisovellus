// firebase configuration

import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCqt1QdccPPFkFwDpH12SCRQhc_941mJzw",
    authDomain: "treenisovellus-9f0a2.firebaseapp.com",
    projectId: "treenisovellus-9f0a2",
    storageBucket: "treenisovellus-9f0a2.firebasestorage.app",
    messagingSenderId: "410643977021",
    appId: "1:410643977021:web:a5acaf2b869e9702256b54",
    measurementId: "G-D9YVVNYB3K"
  };
  
   
const app = initializeApp(firebaseConfig);
const storage = getStorage(app); 

// SyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});


export { auth, storage };



export const db = getFirestore(app);
