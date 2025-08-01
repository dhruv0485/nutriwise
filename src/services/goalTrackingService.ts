import axios from 'axios';

const API_BASE_URL = 'https://nutriwise-m0ob.onrender.com/api';

// Enhanced interfaces
export interface WeightLogEntry {
  id: string;
  user_id: number;
  weight: number;
  bmi?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  notes?: string;
  measurement_time: string;
  logged_at: string;
  created_at: string;
}

export interface WeightLogRequest {
  weight: number;
  height?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  notes?: string;
  measurement_time: string;
}

export interface WeightTrendAnalytics {
  entries: Array<{
    date: string;
    weight: number;
    bmi?: number;
    notes?: string;
    measurement_time: string;
  }>;
  trend: string;
  total_change: number;
  average_weekly_change: number;
  highest_weight: {
    weight: number;
    date: string;
    bmi?: number;
  };
  lowest_weight: {
    weight: number;
    date: string;
    bmi?: number;
  };
  weight_loss_periods: Array<{
    start_date: string;
    end_date: string;
    start_weight: number;
    end_weight: number;
    change: number;
  }>;
  weight_gain_periods: Array<{
    start_date: string;
    end_date: string;
    start_weight: number;
    end_weight: number;
    change: number;
  }>;
  bmi_trend?: Array<{
    date: string;
    bmi: number;
  }>;
}

export interface DailyGoalResponse {
  date: string;
  meals: MealEntry[];
  water_intake?: WaterIntakeEntry;
  weight_entry?: WeightEntry;
  latest_weight_log?: WeightLogEntry;
  exercises: ExerciseEntry[];
  mood?: string;
  sleep_hours?: number;
  daily_notes?: string;
  total_calories_burned: number;
  total_exercise_minutes: number;
}

export interface Analytics {
  weight_trend: WeightTrendAnalytics;
  exercise_summary: {
    total_calories_burned: number;
    total_minutes: number;
    by_type: Record<string, number>;
    active_days: number;
  };
  water_intake_average: number;
  meal_completion_rate: number;
  total_calories_burned: number;
  active_days: number;
}

// Keep existing interfaces...
export interface MealEntry {
  meal_type: string;
  completed: boolean;
  completed_at?: string;
  calories?: number;
  notes?: string;
}

export interface WaterIntakeEntry {
  glasses: number;
  goal: number;
  logged_at: string;
}

export interface WeightEntry {
  weight: number;
  bmi?: number;
  notes?: string;
  logged_at: string;
}

export interface ExerciseEntry {
  exercise_name: string;
  duration_minutes: number;
  calories_burned: number;
  exercise_type?: string;
  intensity?: string;
  notes?: string;
  logged_at: string;
}

class GoalTrackingService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Enhanced weight logging methods
  async addWeightLog(weightData: WeightLogRequest): Promise<WeightLogEntry> {
    try {
      const response = await axios.post(`${API_BASE_URL}/goal-tracking/weight-log`, weightData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding weight log:', error);
      throw error;
    }
  }

  async getWeightLogs(days: number = 30, limit: number = 100): Promise<WeightLogEntry[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/goal-tracking/weight-logs?days=${days}&limit=${limit}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weight logs:', error);
      throw error;
    }
  }

  async deleteWeightLog(logId: string): Promise<any> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/goal-tracking/weight-log/${logId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting weight log:', error);
      throw error;
    }
  }

  async getWeightAnalytics(days: number = 90): Promise<WeightTrendAnalytics> {
    try {
      const response = await axios.get(`${API_BASE_URL}/goal-tracking/weight-analytics?days=${days}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weight analytics:', error);
      throw error;
    }
  }

  // Keep all existing methods...
  async getTodayTracking(): Promise<DailyGoalResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/goal-tracking/today`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching today tracking:', error);
      throw error;
    }
  }

  async updateMealStatus(mealData: {
    meal_type: string;
    completed: boolean;
    calories?: number;
    notes?: string;
  }): Promise<any> {
    try {
      const response = await axios.put(`${API_BASE_URL}/goal-tracking/meal`, mealData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating meal status:', error);
      throw error;
    }
  }

  async updateWaterIntake(waterData: {
    glasses: number;
    goal: number;
  }): Promise<any> {
    try {
      const response = await axios.put(`${API_BASE_URL}/goal-tracking/water-intake`, waterData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating water intake:', error);
      throw error;
    }
  }

  async addExerciseEntry(exerciseData: {
    exercise_name: string;
    duration_minutes: number;
    calories_burned: number;
    exercise_type?: string;
    intensity?: string;
    notes?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/goal-tracking/exercise`, exerciseData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding exercise entry:', error);
      throw error;
    }
  }

  async getAnalytics(days: number = 30): Promise<Analytics> {
    try {
      const response = await axios.get(`${API_BASE_URL}/goal-tracking/analytics?days=${days}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
}

export default new GoalTrackingService();
