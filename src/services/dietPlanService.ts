import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface DietPlanData {
  age: number;
  gender: string;
  weight: number;
  height: number;
  activityLevel: string;
  primaryGoal: string;
  targetWeight: number;
  timeframe: string;
  exerciseFrequency: string;
  dietaryPreferences: string[];
  allergies: string[];
  healthConditions: string[];
  dislikes: string[];
  medications: string;
}

export interface Meal {
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  preparation_time: string;
  instructions: string;
}

export interface DayPlan {
  day: number;
  day_name: string;
  meals: {
    breakfast: Meal;
    morning_snack: Meal;
    lunch: Meal;
    afternoon_snack: Meal;
    dinner: Meal;
  };
  total_calories: number;
  daily_tips: string;
}

export interface DietPlan {
  plan_summary: {
    daily_calories: number;
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
    fiber_grams: number;
    water_glasses: number;
  };
  weekly_plan: DayPlan[];
  shopping_list: {
    proteins: string[];
    vegetables: string[];
    fruits: string[];
    grains: string[];
    dairy: string[];
    others: string[];
  };
  nutrition_tips: string[];
  meal_prep_suggestions: string[];
  user_info?: {
    email: string;
    bmi: number;
    goal: string;
    generated_at: string;
  };
}

class DietPlanService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async generateDietPlan(planData: DietPlanData): Promise<DietPlan> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/dietplan/generate`,
        planData,
        {
          headers: this.getAuthHeaders(),
          timeout: 60000 // 60 second timeout for AI generation
        }
      );
      
      // Get the diet plan from response
      const dietPlan = response.data;
      console.log('Received diet plan from backend:', dietPlan);
      
      return dietPlan;
    } catch (error) {
      console.error('Error generating diet plan:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Authentication required. Please log in to generate diet plans.');
        }
        if (error.response?.status === 500) {
          throw new Error('AI service temporarily unavailable. Please try again in a few moments.');
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. AI generation is taking longer than expected. Please try again.');
        }
      }
      
      // Re-throw the error instead of returning fallback data
      throw new Error('Failed to generate AI diet plan. Please try again.');
    }
  }

  async getUserDietPlans(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dietplan/user-plans`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user diet plans:', error);
      return { plans: [] };
    }
  }
}

export default new DietPlanService();
