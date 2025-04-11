const API_KEY = '3a86e953c3a9b8bc832c356b4873b6756b0d9a19';
const BASE_URL = 'https://wger.de/api/v2';

export const fetchIngredients = async (search = '') => {
  const res = await fetch(`${BASE_URL}/ingredient/?limit=20&name=${search}`, {
    headers: {
      Authorization: `Token ${API_KEY}`,
    },
  });
  return res.json();
};

export const createNutritionPlan = async (targetCalories: number) => {
  try {
    const response = await fetch(`${BASE_URL}/nutritionplan/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calories: targetCalories,
      }),
    });

    if (!response.ok) {
      throw new Error('Error creating nutrition plan');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating nutrition plan:', error);
    throw error;
  }
};

export const fetchNutritionPlans = async () => {
  const res = await fetch(`${BASE_URL}/nutritionplan/`, {
    headers: {
      Authorization: `Token ${API_KEY}`,
    },
  });
  return res.json();
};

export const fetchVideo = async () => {
  const res = await fetch(`${BASE_URL}/video/`, {
    headers: {
      Authorization: `Token ${API_KEY}`,
    },
  });
  return res.json();
};

export const addMealItem = async (planId: number, mealType: string, ingredientId: number) => {
  try {
    const response = await fetch(`${BASE_URL}/mealitem/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nutrition_plan: planId,
        ingredient: ingredientId,
        meal: mealType, 
        amount: 100,     
      }),
    });

    if (!response.ok) {
      throw new Error('Error adding ingredient to meal');
    }

    return response.json();
  } catch (error) {
    console.error('Error adding ingredient:', error);
    throw error;
  }
};
