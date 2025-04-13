import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Progress from 'react-native-progress';
import axios from "axios";
import { db } from "../backend/config"; 
import dayjs from 'dayjs';
import NutritionData from '../components/NutritionData';  

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => setDebouncedValue(value), delay);
  }, [value, delay]);

  return debouncedValue;
};

const NutritionScreen = () => {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState("");
  const [mealItems, setMealItems] = useState({ Breakfast: [], Lunch: [], Dinner: [] });
  const [selectedMeal, setSelectedMeal] = useState("Breakfast");
  const [targetCalories, setTargetCalories] = useState(2000);
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [grams, setGrams] = useState({});
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));  // For date handling

  const debouncedSearch = useDebounce(search, 500);

  const fetchIngredients = async () => {
    if (!debouncedSearch.trim()) {
      setIngredients([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`https://wger.de/api/v2/ingredient/?name=${debouncedSearch}&source_name=Open%20Food%20Facts`);
      const results = response.data.results || [];
      const filteredResults = results.filter(item =>
        item.name && item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setIngredients(filteredResults);
      setNextPage(response.data.next);
    } catch (error) {
      console.error("Error fetching ingredients:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGramsChange = (id, value) => {
    const numericValue = parseInt(value) || 0;
    setGrams(prev => ({ ...prev, [id]: numericValue }));
  };

  const addToMeal = (item) => {
    const gramsInput = grams[item.id] || 100;

    const calories = (item.energy * gramsInput) / 100;
    const protein = (item.protein * gramsInput) / 100;
    const carbs = (item.carbohydrates * gramsInput) / 100;
    const fat = (item.fat * gramsInput) / 100;

    const updatedItem = {
      ...item,
      grams: gramsInput,
      energy: calories,
      protein,
      carbohydrates: carbs,
      fat,
    };

    const updatedMeal = [...mealItems[selectedMeal], updatedItem];
    setMealItems({ ...mealItems, [selectedMeal]: updatedMeal });
  };

  const removeFromMeal = (meal, index) => {
    const updatedMeal = mealItems[meal].filter((_, i) => i !== index);
    setMealItems({ ...mealItems, [meal]: updatedMeal });
  };

  const totalCalories = Object.values(mealItems).flat().reduce((acc, item) => acc + (item.energy || 0), 0);
  const remainingCalories = Math.max(targetCalories - totalCalories, 0);

  const macro = Object.values(mealItems).flat().reduce(
    (acc, item) => {
      acc.protein += parseFloat(item.protein || 0);
      acc.carbs += parseFloat(item.carbohydrates || 0);
      acc.fat += parseFloat(item.fat || 0);
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 }
  );

  const recommendedMacros = {
    carbs: (targetCalories * 0.40) / 4,
    protein: (targetCalories * 0.30) / 4,
    fat: (targetCalories * 0.30) / 9,
  };

  const handleSearchChange = (text) => setSearch(text);

  const loadMoreIngredients = () => {
    if (nextPage) {
      axios.get(nextPage).then((response) => {
        const newResults = response.data.results || [];
        const filteredResults = newResults.filter(item =>
          item.name && item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
        setIngredients(prev => [...prev, ...filteredResults]);
        setNextPage(response.data.next);
      });
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [debouncedSearch]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Nutrition Dashboard</Text>

        <View style={styles.summaryCard}>
          <AnimatedCircularProgress
            size={140}
            width={12}
            fill={(totalCalories / targetCalories) * 100}
            tintColor="#00e0ff"
            backgroundColor="#3d5875">
            {() => (
              <Text style={styles.circleText}>
                {remainingCalories}{"\n"}
                <Text style={styles.circleSubText}>Remaining</Text>
              </Text>
            )}
          </AnimatedCircularProgress>

          <Text style={styles.statText}>Eaten: {totalCalories.toFixed(0)} kcal</Text>
          <Text style={styles.statText}>Target: {targetCalories} kcal</Text>

          <Text style={styles.macroTitle}>Carbs (Recommended)</Text>
          <Progress.Bar progress={macro.carbs / recommendedMacros.carbs} width={250} color="#5DADE2" />
          <Text style={styles.macroValue}>{macro.carbs.toFixed(1)} / {recommendedMacros.carbs.toFixed(1)} g</Text>

          <Text style={styles.macroTitle}>Protein (Recommended)</Text>
          <Progress.Bar progress={macro.protein / recommendedMacros.protein} width={250} color="#58D68D" />
          <Text style={styles.macroValue}>{macro.protein.toFixed(1)} / {recommendedMacros.protein.toFixed(1)} g</Text>

          <Text style={styles.macroTitle}>Fat (Recommended)</Text>
          <Progress.Bar progress={macro.fat / recommendedMacros.fat} width={250} color="#F5B041" />
          <Text style={styles.macroValue}>{macro.fat.toFixed(1)} / {recommendedMacros.fat.toFixed(1)} g</Text>
        </View>

        <TextInput
          placeholder="Enter target calories"
          keyboardType="numeric"
          style={styles.input}
          value={String(targetCalories)}
          onChangeText={(text) => setTargetCalories(Number(text))}
        />

        <View style={styles.mealButtons}>
          {["Breakfast", "Lunch", "Dinner"].map((meal) => (
            <TouchableOpacity
              key={meal}
              style={[styles.mealButton, selectedMeal === meal && styles.mealButtonActive]}
              onPress={() => setSelectedMeal(meal)}>
              <Text style={styles.mealText}>{meal}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          placeholder="Search ingredients..."
          style={styles.input}
          value={search}
          onChangeText={handleSearchChange}
        />

        {debouncedSearch ? (
          <View style={styles.ingredientsList}>
            {loading ? (
              <ActivityIndicator size="large" />
            ) : ingredients.length > 0 ? (
              <FlatList
                data={ingredients}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => (
                  <View style={styles.ingredientItem}>
                    <Text style={styles.bold}>{item.name}</Text>
                    <Text>Calories: {item.energy} kcal</Text>
                    <TextInput
                      keyboardType="numeric"
                      placeholder="Enter grams"
                      style={styles.input}
                      value={grams[item.id]?.toString() || '100'}
                      onChangeText={(text) => handleGramsChange(item.id, text)}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={() => addToMeal(item)}>
                      <Text style={styles.addButtonText}>Add to {selectedMeal}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                onEndReached={loadMoreIngredients}
                onEndReachedThreshold={0.1}
              />
            ) : (
              <Text style={{ color: "#aaa", marginTop: 10 }}>No ingredients found</Text>
            )}
          </View>
        ) : null}

        {["Breakfast", "Lunch", "Dinner"].map((meal) => (
          <View key={meal} style={{ width: '100%' }}>
            <Text style={styles.subheader}>{meal}</Text>
            <FlatList
              data={mealItems[meal]}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item, index }) => (
                <View style={styles.mealItem}>
                  <Text>{item.name} - {item.energy.toFixed(0)} kcal</Text>
                  <Text>{item.grams} g</Text>
                  <TouchableOpacity onPress={() => removeFromMeal(meal, index)}>
                    <Text style={{ color: '#f55' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        ))}

        <NutritionData
          selectedDate={selectedDate}
          mealItems={mealItems}
          setMealItems={setMealItems}
          targetCalories={targetCalories}
          setTargetCalories={setTargetCalories}
        />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1, alignItems: 'center', paddingBottom: 100 },
  header: { fontSize: 26, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  summaryCard: { backgroundColor: '#1c1f26', borderRadius: 20, padding: 20, alignItems: 'center', width: '100%' },
  circleText: { color: '#fff', fontSize: 24, textAlign: 'center' },
  circleSubText: { fontSize: 16, color: '#aaa' },
  statText: { color: '#fff', fontSize: 16, marginVertical: 5 },
  macroTitle: { color: '#ccc', marginTop: 10, fontWeight: '600' },
  macroValue: { color: '#999', fontSize: 12, marginBottom: 5 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 10, width: '100%' },
  mealButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10, width: '100%' },
  mealButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#eee' },
  mealButtonActive: { backgroundColor: '#4CAF50' },
  mealText: { color: '#000' },
  subheader: { fontSize: 18, fontWeight: '600', marginTop: 16, color: '#000', alignSelf: 'flex-start' },
  mealItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, width: '100%' },
  ingredientItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee', width: '100%' },
  bold: { fontWeight: 'bold', color: '#000' },
  ingredientsList: { width: '100%' },
  addButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 10, marginTop: 10 },
  addButtonText: { color: '#fff', textAlign: 'center' }
});

export default NutritionScreen;
