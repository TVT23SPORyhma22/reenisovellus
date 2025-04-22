import React, { useState, useEffect } from 'react';
import { auth, db } from '../backend/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ActivityIndicator, TouchableOpacity, Text, StyleSheet } from 'react-native';

const NutritionData = ({ selectedDate, mealItems, setMealItems, targetCalories, setTargetCalories }) => {
  const [loading, setLoading] = useState(false);

  const saveDataToFirebase = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;  
      if (!user) return;
      

      await setDoc(doc(db, "nutrition", selectedDate), {
        userId: user.uid,  
        mealItems,
        targetCalories,
      });
      console.log("Data saved!");
    } catch (e) {
      console.error("Error saving data:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadDataFromFirebase = async (date) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      

      const docRef = doc(db, "nutrition", date);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userId === user.uid) {
          setMealItems(data.mealItems || { Breakfast: [], Lunch: [], Dinner: [] });
          setTargetCalories(data.targetCalories || 2000);
        } else {
          console.error("Unauthorized access to nutrition data.");
        }
      } else {
        setMealItems({ Breakfast: [], Lunch: [], Dinner: [] });
        setTargetCalories(2000);
      }
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromFirebase(selectedDate); 
  }, [selectedDate]);

  return (
    <>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={saveDataToFirebase}>
          <Text style={styles.addButtonText}>Save</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  addButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 10, marginTop: 20 },
  addButtonText: { color: '#fff', textAlign: 'center' },
});

export default NutritionData;