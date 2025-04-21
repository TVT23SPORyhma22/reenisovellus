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
} from "react-native";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Progress from 'react-native-progress';
import axios from "axios";

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
  const [grams, setGrams] = useState({}); // State for storing grams of each product

  const debouncedSearch = useDebounce(search, 500);

  // Base URL and query parameters
  const baseUrl = "https://wger.de/api/v2/ingredient";
  const url = new URL(baseUrl);

  const fetchIngredients = async () => {
    if (!debouncedSearch.trim()) {
      setIngredients([]);
      return;
    }

    const params = new URLSearchParams();
    params.append('name', debouncedSearch);
    params.append('source_name', 'Open Food Facts');
    url.search = params.toString();

    try {
      setLoading(true);
      const response = await axios.get(url.href);
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
    setGrams(prev => ({ ...prev, [id]: value }));
  };

  const addToMeal = (item) => {
    const gramsInput = grams[item.id] || 100; // Take the grams input for this product (default 100 g)

    // Calculate calories and macronutrients based on grams
    const calories = ((item.energy || 0) * gramsInput) / 100;
    const protein = ((item.protein || 0) * gramsInput) / 100;
    const carbs = ((item.carbohydrates || 0) * gramsInput) / 100;
    const fat = ((item.fat || 0) * gramsInput) / 100;

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

  // Recommended macronutrients based on targetCalories
  const recommendedMacros = {
    carbs: (targetCalories * 0.40) / 4, // 40% carbs (1 g carbs = 4 calories)
    protein: (targetCalories * 0.30) / 4, // 30% protein (1 g protein = 4 calories)
    fat: (targetCalories * 0.30) / 9, // 30% fat (1 g fat = 9 calories)
  };

  const handleSearchChange = (text) => setSearch(text);

  const loadMoreIngredients = () => {
    if (nextPage) {
      fetchIngredients(debouncedSearch, nextPage);
    }
  };

  useEffect(() => {
    if (debouncedSearch.trim()) {
      fetchIngredients();
    } else {
      setIngredients([]);
    }
  }, [debouncedSearch]);

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
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

              <Text style={styles.statText}>Eaten: {totalCalories} kcal</Text>
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
          </>
        }
        data={["Breakfast", "Lunch", "Dinner"]}
        keyExtractor={(meal) => meal}
        renderItem={({ item: meal }) => (
          <View style={{ width: '100%' }}>
            <Text style={styles.subheader}>{meal}</Text>
            <FlatList
              data={mealItems[meal]}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item, index }) => (
                <View style={styles.mealItem}>
                  <Text>{item.name} - {item.energy} kcal</Text>
                  <Text>{item.grams} g</Text>
                  <TouchableOpacity onPress={() => removeFromMeal(meal, index)}>
                    <Text style={{ color: '#f55' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1, alignItems: 'center' },
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
