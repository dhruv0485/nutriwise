import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Target, Dumbbell, BarChart3, AlertCircle, Loader,
  Droplets, Scale, Activity, CheckCircle, Plus, Flame, Timer,
  X, Minus, TrendingUp, TrendingDown, Calendar, Trash2, Edit,
  LineChart, PieChart, Sun, Moon, Coffee, Utensils, Star,
  Save, Eye, Info, Package, Zap, Heart
} from 'lucide-react';

// Enhanced interfaces for weight logging
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

// Enhanced Goal Tracking Service
class GoalTrackingService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getTodayTracking(): Promise<DailyGoalResponse> {
    try {
      const response = await fetch('http://localhost:8000/api/goal-tracking/today', {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch today tracking');
      return response.json();
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
      const response = await fetch('http://localhost:8000/api/goal-tracking/meal', {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(mealData)
      });
      if (!response.ok) throw new Error('Failed to update meal status');
      return response.json();
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
      const response = await fetch('http://localhost:8000/api/goal-tracking/water-intake', {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(waterData)
      });
      if (!response.ok) throw new Error('Failed to update water intake');
      return response.json();
    } catch (error) {
      console.error('Error updating water intake:', error);
      throw error;
    }
  }

  async addWeightLog(weightData: WeightLogRequest): Promise<WeightLogEntry> {
    try {
      const response = await fetch('http://localhost:8000/api/goal-tracking/weight-log', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(weightData)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to add weight log: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error adding weight log:', error);
      throw error;
    }
  }

  async getWeightLogs(days: number = 30, limit: number = 100): Promise<WeightLogEntry[]> {
    try {
      const response = await fetch(`http://localhost:8000/api/goal-tracking/weight-logs?days=${days}&limit=${limit}`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch weight logs');
      return response.json();
    } catch (error) {
      console.error('Error fetching weight logs:', error);
      throw error;
    }
  }

  async deleteWeightLog(logId: string): Promise<any> {
    try {
      const response = await fetch(`http://localhost:8000/api/goal-tracking/weight-log/${logId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete weight log');
      return response.json();
    } catch (error) {
      console.error('Error deleting weight log:', error);
      throw error;
    }
  }

  async getWeightAnalytics(days: number = 90): Promise<WeightTrendAnalytics> {
    try {
      const response = await fetch(`http://localhost:8000/api/goal-tracking/weight-analytics?days=${days}`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch weight analytics');
      return response.json();
    } catch (error) {
      console.error('Error fetching weight analytics:', error);
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
      const response = await fetch('http://localhost:8000/api/goal-tracking/exercise', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(exerciseData)
      });
      if (!response.ok) throw new Error('Failed to add exercise entry');
      return response.json();
    } catch (error) {
      console.error('Error adding exercise entry:', error);
      throw error;
    }
  }

  async getAnalytics(days: number = 30): Promise<Analytics> {
    try {
      const response = await fetch(`http://localhost:8000/api/goal-tracking/analytics?days=${days}`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
}

const goalTrackingService = new GoalTrackingService();

interface GoalTrackerProps {
  onNavigate: (page: string) => void;
  userName: string;
}

const GoalTracker = ({ onNavigate, userName }: GoalTrackerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [todayData, setTodayData] = useState<DailyGoalResponse | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLogEntry[]>([]);
  const [weightAnalytics, setWeightAnalytics] = useState<WeightTrendAnalytics | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Form states
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showWeightHistory, setShowWeightHistory] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  
  const [weightForm, setWeightForm] = useState<WeightLogRequest>({
    weight: 0,
    height: undefined,
    body_fat_percentage: undefined,
    muscle_mass: undefined,
    notes: '',
    measurement_time: 'morning'
  });

  const [exerciseForm, setExerciseForm] = useState({
    exercise_name: '',
    duration_minutes: '',
    calories_burned: '',
    exercise_type: '',
    intensity: '',
    notes: ''
  });

  useEffect(() => {
    fetchTodayData();
    if (activeTab === 'analytics') {
      fetchAnalytics();
      fetchWeightHistory();
    }
  }, [activeTab]);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await goalTrackingService.getTodayTracking();
      setTodayData(data);
    } catch (error) {
      console.error('Error fetching today data:', error);
      setError('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeightHistory = async () => {
    try {
      const logs = await goalTrackingService.getWeightLogs(90, 100);
      setWeightLogs(logs);
      
      const analytics = await goalTrackingService.getWeightAnalytics(90);
      setWeightAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching weight history:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await goalTrackingService.getAnalytics(30);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    }
  };

  const handleMealToggle = async (mealType: string, completed: boolean) => {
    try {
      await goalTrackingService.updateMealStatus({
        meal_type: mealType,
        completed: completed,
        calories: 0
      });
      await fetchTodayData();
    } catch (error) {
      console.error('Error updating meal status:', error);
      setError('Failed to update meal status');
    }
  };

  const handleWaterIntake = async (glasses: number) => {
    try {
      const currentGoal = todayData?.water_intake?.goal || 8;
      await goalTrackingService.updateWaterIntake({
        glasses: Math.max(0, glasses),
        goal: currentGoal
      });
      await fetchTodayData();
    } catch (error) {
      console.error('Error updating water intake:', error);
      setError('Failed to update water intake');
    }
  };

  const handleWeightSubmit = async () => {
    try {
      if (!weightForm.weight || weightForm.weight < 20 || weightForm.weight > 500) {
        setError('Please enter a valid weight between 20 and 500 kg');
        return;
      }
      
      // Validate optional fields if provided
      if (weightForm.height && (weightForm.height < 100 || weightForm.height > 250)) {
        setError('Height must be between 100 and 250 cm');
        return;
      }
      
      if (weightForm.body_fat_percentage && (weightForm.body_fat_percentage < 0 || weightForm.body_fat_percentage > 100)) {
        setError('Body fat percentage must be between 0 and 100%');
        return;
      }
      
      if (weightForm.muscle_mass && (weightForm.muscle_mass < 0 || weightForm.muscle_mass > 200)) {
        setError('Muscle mass must be between 0 and 200 kg');
        return;
      }
      
      if (weightForm.notes && weightForm.notes.length > 500) {
        setError('Notes must be 500 characters or less');
        return;
      }
      
      console.log('Sending weight data:', weightForm);
      await goalTrackingService.addWeightLog(weightForm);
      
      setWeightForm({
        weight: 0,
        height: undefined,
        body_fat_percentage: undefined,
        muscle_mass: undefined,
        notes: '',
        measurement_time: 'morning'
      });
      setShowWeightForm(false);
      setError(null); // Clear any previous errors
      
      await fetchTodayData();
      await fetchWeightHistory();
    } catch (error) {
      console.error('Error adding weight log:', error);
      setError('Failed to add weight entry');
    }
  };

  const handleExerciseSubmit = async () => {
    try {
      if (!exerciseForm.exercise_name || !exerciseForm.duration_minutes || !exerciseForm.calories_burned) {
        return;
      }
      
      await goalTrackingService.addExerciseEntry({
        exercise_name: exerciseForm.exercise_name,
        duration_minutes: parseInt(exerciseForm.duration_minutes),
        calories_burned: parseInt(exerciseForm.calories_burned),
        exercise_type: exerciseForm.exercise_type || undefined,
        intensity: exerciseForm.intensity || undefined,
        notes: exerciseForm.notes || undefined
      });
      
      setExerciseForm({
        exercise_name: '',
        duration_minutes: '',
        calories_burned: '',
        exercise_type: '',
        intensity: '',
        notes: ''
      });
      setShowExerciseForm(false);
      await fetchTodayData();
    } catch (error) {
      console.error('Error adding exercise entry:', error);
      setError('Failed to add exercise entry');
    }
  };

  const handleDeleteWeightLog = async (logId: string) => {
    if (window.confirm('Are you sure you want to delete this weight entry?')) {
      try {
        await goalTrackingService.deleteWeightLog(logId);
        await fetchWeightHistory();
        await fetchTodayData();
      } catch (error) {
        console.error('Error deleting weight log:', error);
        setError('Failed to delete weight entry');
      }
    }
  };

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case 'breakfast': return <Sun className="h-5 w-5" />;
      case 'lunch': return <Utensils className="h-5 w-5" />;
      case 'dinner': return <Moon className="h-5 w-5" />;
      case 'snacks': return <Coffee className="h-5 w-5" />;
      default: return <Utensils className="h-5 w-5" />;
    }
  };

  // Weight chart component
  const WeightChart = ({ data }: { data: WeightTrendAnalytics }) => {
    if (!data.entries || data.entries.length === 0) {
      return (
        <div className="text-center py-8">
          <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No weight data available</p>
        </div>
      );
    }

    const maxWeight = Math.max(...data.entries.map(e => e.weight));
    const minWeight = Math.min(...data.entries.map(e => e.weight));
    const range = maxWeight - minWeight || 1;
    
    return (
      <div className="space-y-4">
        <div className="h-48 sm:h-64 bg-gray-50 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute inset-4">
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={`${y}%`}
                  x2="100%"
                  y2={`${y}%`}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              
              {/* Weight line */}
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                points={data.entries.map((entry, index) => {
                  const x = (index / (data.entries.length - 1)) * 100;
                  const y = 100 - ((entry.weight - minWeight) / range) * 100;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Data points */}
              {data.entries.map((entry, index) => {
                const x = (index / (data.entries.length - 1)) * 100;
                const y = 100 - ((entry.weight - minWeight) / range) * 100;
                return (
                  <circle
                    key={index}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill="#059669"
                    className="hover:r-6 cursor-pointer"
                  />
                );
              })}
            </svg>
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
            <span>{maxWeight.toFixed(1)}kg</span>
            <span>{((maxWeight + minWeight) / 2).toFixed(1)}kg</span>
            <span>{minWeight.toFixed(1)}kg</span>
          </div>
        </div>
        
        {/* Chart legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Change</p>
            <p className={`text-lg font-bold ${
              data.total_change > 0 ? 'text-red-600' : 
              data.total_change < 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {data.total_change > 0 ? '+' : ''}{data.total_change}kg
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Weekly Average</p>
            <p className={`text-lg font-bold ${
              data.average_weekly_change > 0 ? 'text-red-600' : 
              data.average_weekly_change < 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {data.average_weekly_change > 0 ? '+' : ''}{data.average_weekly_change}kg
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trend</p>
            <p className={`text-lg font-bold capitalize flex items-center justify-center ${
              data.trend === 'decreasing' ? 'text-green-600' :
              data.trend === 'increasing' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {data.trend === 'decreasing' && <TrendingDown className="h-4 w-4 mr-1" />}
              {data.trend === 'increasing' && <TrendingUp className="h-4 w-4 mr-1" />}
              {data.trend}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-green-200 rounded-full animate-spin border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Target className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Loading Your Progress</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <Loader className="animate-spin h-4 w-4 mr-3 text-green-600" />
              <span>📊 Fetching your data...</span>
            </div>
            <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <Loader className="animate-spin h-4 w-4 mr-3 text-green-600" />
              <span>⚖️ Calculating trends...</span>
            </div>
            <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <Loader className="animate-spin h-4 w-4 mr-3 text-green-600" />
              <span>🎯 Preparing insights...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white shadow-2xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-10 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-white hover:text-green-200 transition-colors bg-white/20 p-2 rounded-xl backdrop-blur-sm"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm inline-block mb-6">
              <Target className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Goal Tracker</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">Track your daily wellness journey, {userName}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8 pb-24 md:pb-8">
        {/* Tab Navigation - Desktop Only */}
        <div className="hidden md:flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-xl border border-gray-100">
            <div className="flex space-x-2">
              {[
                { id: 'overview', label: 'Overview', icon: Target },
                { id: 'fitness', label: 'Fitness', icon: Dumbbell },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards with Enhanced Weight Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Calories Burned</p>
                    <p className="text-3xl font-bold text-green-600">
                      {todayData?.total_calories_burned || 0}
                    </p>
                    <p className="text-xs text-gray-500">from exercises</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                    <Flame className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Water</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {todayData?.water_intake?.glasses || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      of {todayData?.water_intake?.goal || 8} glasses
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
                    <Droplets className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Exercise</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {todayData?.exercises?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">activities logged</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Enhanced Weight Card */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Weight Today</p>
                    {todayData?.latest_weight_log ? (
                      <>
                        <p className="text-3xl font-bold text-indigo-600">
                          {todayData.latest_weight_log.weight}kg
                        </p>
                        <p className="text-xs text-gray-500">
                          {todayData.latest_weight_log.bmi && `BMI: ${todayData.latest_weight_log.bmi}`}
                          <span className="mx-1">•</span>
                          {todayData.latest_weight_log.measurement_time}
                        </p>
                        <div className="flex space-x-1 mt-2">
                          <button
                            onClick={() => setShowWeightForm(true)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Add Entry
                          </button>
                          <span className="text-xs text-gray-400">•</span>
                          <button
                            onClick={() => setShowWeightHistory(true)}
                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            View History
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowWeightForm(true)}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Add Weight
                      </button>
                    )}
                  </div>
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl">
                    <Scale className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Meals */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-2 rounded-lg mr-3">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                Today's Meals
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {todayData?.meals?.map((meal, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-2 rounded-lg mr-3">
                          {getMealIcon(meal.meal_type)}
                        </div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {meal.meal_type.replace('_', ' ')}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleMealToggle(meal.meal_type, !meal.completed)}
                        className={`p-2 rounded-full transition-all duration-300 ${
                          meal.completed
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {meal.completed && meal.completed_at ? (
                        <p className="text-green-600 font-medium">Completed at {new Date(meal.completed_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      ) : (
                        <p className="text-gray-400">Not completed</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Water Intake */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
                    <Droplets className="h-5 w-5 text-white" />
                  </div>
                  Water Intake
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleWaterIntake((todayData?.water_intake?.glasses || 0) - 1)}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all duration-300 hover:scale-110"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleWaterIntake((todayData?.water_intake?.glasses || 0) + 1)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all duration-300 hover:scale-110"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span className="font-medium">{todayData?.water_intake?.glasses || 0} glasses</span>
                    <span className="font-medium">Goal: {todayData?.water_intake?.goal || 8}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                      style={{
                        width: `${Math.min(
                          ((todayData?.water_intake?.glasses || 0) / (todayData?.water_intake?.goal || 8)) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
                  <Droplets className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fitness Tab */}
        {activeTab === 'fitness' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                  <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                Fitness Tracking
              </h2>
              <button
                onClick={() => setShowExerciseForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-emerald-800 flex items-center shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Exercise
              </button>
            </div>

            {/* Today's Exercises */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                Today's Activities
              </h3>
              {todayData?.exercises && todayData.exercises.length > 0 ? (
                <div className="space-y-4">
                  {todayData.exercises.map((exercise, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <h4 className="font-semibold text-gray-900 text-base sm:text-lg">{exercise.exercise_name}</h4>
                        <div className="flex items-center space-x-2 sm:space-x-4 text-sm text-gray-600">
                          <span className="flex items-center bg-blue-100 px-2 sm:px-3 py-1 rounded-full">
                            <Timer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-blue-600" />
                            {exercise.duration_minutes} min
                          </span>
                          <span className="flex items-center bg-orange-100 px-2 sm:px-3 py-1 rounded-full">
                            <Flame className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-600" />
                            {exercise.calories_burned} cal
                          </span>
                        </div>
                      </div>
                      {exercise.exercise_type && (
                        <p className="text-sm text-gray-600 capitalize mb-2">
                          <strong className="text-purple-600">Type:</strong> {exercise.exercise_type}
                        </p>
                      )}
                      {exercise.intensity && (
                        <p className="text-sm text-gray-600 capitalize mb-2">
                          <strong className="text-purple-600">Intensity:</strong> {exercise.intensity}
                        </p>
                      )}
                      {exercise.notes && (
                        <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-3 rounded-lg">{exercise.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-2xl inline-block mb-4">
                    <Dumbbell className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">No exercises logged today</p>
                  <button
                    onClick={() => setShowExerciseForm(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-800 shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Log Your First Exercise
                  </button>
                </div>
              )}
            </div>

            {/* Exercise Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl inline-block mb-4">
                    <Flame className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{todayData?.total_calories_burned || 0}</p>
                  <p className="text-sm text-gray-600 font-medium">Calories Burned</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl inline-block mb-4">
                    <Timer className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{todayData?.total_exercise_minutes || 0}</p>
                  <p className="text-sm text-gray-600 font-medium">Minutes Active</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl inline-block mb-4">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{todayData?.exercises?.length || 0}</p>
                  <p className="text-sm text-gray-600 font-medium">Activities</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab with Enhanced Weight Trends */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              Analytics & Trends
            </h2>

            {/* Weight Analytics Section */}
            {weightAnalytics && (
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg mr-3">
                      <Scale className="h-5 w-5 text-white" />
                    </div>
                    Weight Progress
                  </h3>
                  <button
                    onClick={() => setShowWeightHistory(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-800 text-sm shadow-lg transition-all duration-300"
                  >
                    View All Entries
                  </button>
                </div>
                
                <WeightChart data={weightAnalytics} />

                {/* Weight Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                    <p className="text-sm text-gray-600 font-medium">Highest Weight</p>
                    <p className="text-xl font-bold text-gray-900">
                      {weightAnalytics.highest_weight?.weight}kg
                    </p>
                    <p className="text-xs text-gray-500">
                      {weightAnalytics.highest_weight?.date && 
                        new Date(weightAnalytics.highest_weight.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <p className="text-sm text-gray-600 font-medium">Lowest Weight</p>
                    <p className="text-xl font-bold text-gray-900">
                      {weightAnalytics.lowest_weight?.weight}kg
                    </p>
                    <p className="text-xs text-gray-500">
                      {weightAnalytics.lowest_weight?.date && 
                        new Date(weightAnalytics.lowest_weight.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-600 font-medium">Weight Loss Periods</p>
                    <p className="text-xl font-bold text-green-600">
                      {weightAnalytics.weight_loss_periods?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">periods tracked</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <p className="text-sm text-gray-600 font-medium">Total Entries</p>
                    <p className="text-xl font-bold text-blue-600">
                      {weightAnalytics.entries?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">weight logs</p>
                  </div>
                </div>
              </div>
            )}

            {/* Exercise Analytics */}
            {analytics && (
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  Exercise Summary (30 days)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl inline-block mb-3">
                      <Flame className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-orange-600">
                      {analytics.exercise_summary.total_calories_burned}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Total Calories</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl inline-block mb-3">
                      <Timer className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                      {analytics.exercise_summary.total_minutes}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Total Minutes</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl inline-block mb-3">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      {analytics.exercise_summary.active_days}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Active Days</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl inline-block mb-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.round(analytics.meal_completion_rate)}%
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Meal Completion</p>
                  </div>
                </div>

                {/* Exercise by Type */}
                {Object.keys(analytics.exercise_summary.by_type).length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Exercise by Type (minutes)</h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.exercise_summary.by_type).map(([type, minutes]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">{type}</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${(minutes / Math.max(...Object.values(analytics.exercise_summary.by_type))) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">{minutes}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Stats */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl inline-block mb-4">
                      <Droplets className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics.water_intake_average}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Average Daily Water (glasses)</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl inline-block mb-4">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.round(analytics.meal_completion_rate)}%
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Meal Completion Rate</p>
                  </div>
                </div>
              </div>
            )}

            {!analytics && (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading analytics...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Weight Entry Modal */}
      {showWeightForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Log Weight Entry</h3>
              <button
                onClick={() => setShowWeightForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="500"
                  value={weightForm.weight || ''}
                  onChange={(e) => setWeightForm(prev => ({ 
                    ...prev, 
                    weight: e.target.value ? parseFloat(e.target.value) : 0 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your weight (20-500 kg)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm) - For BMI</label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={weightForm.height || ''}
                  onChange={(e) => setWeightForm(prev => ({ 
                    ...prev, 
                    height: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Optional - for BMI calculation (100-250 cm)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Fat % (Optional)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={weightForm.body_fat_percentage || ''}
                  onChange={(e) => setWeightForm(prev => ({ 
                    ...prev, 
                    body_fat_percentage: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Body fat percentage (0-100%)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Muscle Mass (kg) (Optional)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  value={weightForm.muscle_mass || ''}
                  onChange={(e) => setWeightForm(prev => ({ 
                    ...prev, 
                    muscle_mass: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Muscle mass in kg (0-200 kg)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Time</label>
                <select
                  value={weightForm.measurement_time}
                  onChange={(e) => setWeightForm(prev => ({ 
                    ...prev, 
                    measurement_time: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={weightForm.notes}
                  onChange={(e) => setWeightForm(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  maxLength={500}
                  placeholder="Any notes about this measurement... (max 500 characters)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowWeightForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWeightSubmit}
                disabled={!weightForm.weight || weightForm.weight < 20 || weightForm.weight > 500}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Log Weight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weight History Modal */}
      {showWeightHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Weight History</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowWeightForm(true)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Add Entry
                </button>
                <button
                  onClick={() => setShowWeightHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-96">
              {weightLogs.length > 0 ? (
                <div className="space-y-3">
                  {weightLogs.map((log) => (
                    <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div>
                              <p className="text-base sm:text-lg font-semibold text-gray-900">
                                {log.weight}kg
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {new Date(log.logged_at).toLocaleDateString()} - {log.measurement_time}
                              </p>
                            </div>
                            
                            {log.bmi && (
                              <div className="text-center">
                                <p className="text-xs sm:text-sm text-gray-600">BMI</p>
                                <p className="font-semibold text-sm sm:text-base">{log.bmi}</p>
                              </div>
                            )}
                            
                            {log.body_fat_percentage && (
                              <div className="text-center">
                                <p className="text-xs sm:text-sm text-gray-600">Body Fat</p>
                                <p className="font-semibold text-sm sm:text-base">{log.body_fat_percentage}%</p>
                              </div>
                            )}
                            
                            {log.muscle_mass && (
                              <div className="text-center">
                                <p className="text-xs sm:text-sm text-gray-600">Muscle Mass</p>
                                <p className="font-semibold text-sm sm:text-base">{log.muscle_mass}kg</p>
                              </div>
                            )}
                          </div>
                          
                          {log.notes && (
                            <p className="text-sm text-gray-600 mt-2">{log.notes}</p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleDeleteWeightLog(log.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No weight entries found</p>
                  <button
                    onClick={() => {
                      setShowWeightHistory(false);
                      setShowWeightForm(true);
                    }}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add Your First Entry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Entry Modal */}
      {showExerciseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Log Exercise</h3>
              <button
                onClick={() => setShowExerciseForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name *</label>
                <input
                  type="text"
                  value={exerciseForm.exercise_name}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, exercise_name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Running, Push-ups, Yoga"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min) *</label>
                  <input
                    type="number"
                    value={exerciseForm.duration_minutes}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories *</label>
                  <input
                    type="number"
                    value={exerciseForm.calories_burned}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, calories_burned: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="250"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Type</label>
                <select
                  value={exerciseForm.exercise_type}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, exercise_type: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intensity</label>
                <select
                  value={exerciseForm.intensity}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, intensity: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select intensity</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={exerciseForm.notes}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  placeholder="How did it feel?"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExerciseForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExerciseSubmit}
                disabled={!exerciseForm.exercise_name || !exerciseForm.duration_minutes || !exerciseForm.calories_burned}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Log Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating macOS Style Bottom Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl px-2 py-3">
          <div className="flex items-center space-x-1">
            {[
              { id: 'overview', icon: Target },
              { id: 'fitness', icon: Dumbbell },
              { id: 'analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-green-600 bg-green-50 shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`h-6 w-6 ${
                  activeTab === tab.id ? 'text-green-600' : 'text-gray-500'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalTracker;
