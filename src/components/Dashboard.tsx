import React, { useState, useEffect } from 'react';
import {
  Target, Dumbbell, BookOpen, Calendar, User, Settings, Bell,
  Home, Activity, Droplets, Scale, TrendingUp, Brain, Award,
  ChevronRight, Plus, Eye, Heart, Flame, Clock, Star, Utensils,
  Sun, Moon, Coffee, CheckCircle, AlertCircle, Loader, Leaf,
  ArrowRight, Zap, Sparkles, MessageCircle
} from 'lucide-react';

// Import all your services
import { apiService } from '../services/api';
import quizService from '../services/quizService';
import { consultationApi } from '../services/consultationApi';
import dietPlanService from '../services/dietPlanService';
import goalTrackingService from '../services/goalTrackingService';
import profileService from '../services/profileService';

// Import types
import type { UserResponse } from '../services/api';
import type { QuizQuestion, TipOfTheDay } from '../services/quizService';
import type { DailyGoalResponse, Analytics } from '../services/goalTrackingService';
import type { UserProfile } from '../services/profileService';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface ConsultationBooking {
  id: string;
  booking_id: number;
  dietitian: {
    name: string;
    specialization: string;
    profile_image?: string;
  };
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  status: string;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  // State for user data
  const [user, setUser] = useState<UserResponse | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // State for dashboard data
  const [todayData, setTodayData] = useState<DailyGoalResponse | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tipOfTheDay, setTipOfTheDay] = useState<TipOfTheDay | null>(null);
  const [quizData, setQuizData] = useState<QuizQuestion | null>(null);
  const [consultations, setConsultations] = useState<ConsultationBooking[]>([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<{ is_correct: boolean; message: string } | null>(null);

  // Calculated values
  const [bmiStatus, setBmiStatus] = useState<{
    value: number;
    category: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        userData,
        profileData,
        todayTrackingData,
        analyticsData,
        tipData,
        quizQuestionData,
        consultationsData
      ] = await Promise.allSettled([
        apiService.getCurrentUser(),
        profileService.getCurrentUserProfile(),
        goalTrackingService.getTodayTracking(),
        goalTrackingService.getAnalytics(7), // Get week's data
        quizService.getTipOfTheDay(),
        quizService.generateQuestion(),
        consultationApi.getMyBookings()
      ]);

      // Handle user data
      if (userData.status === 'fulfilled') {
        setUser(userData.value);
      } else {
        console.error('Error fetching user data:', userData.reason);
      }

      // Handle profile data
      if (profileData.status === 'fulfilled') {
        setUserProfile(profileData.value);
        calculateBMI(profileData.value);
      } else {
        console.error('Error fetching profile data:', profileData.reason);
      }

      // Handle today's tracking data
      if (todayTrackingData.status === 'fulfilled') {
        setTodayData(todayTrackingData.value);
      } else {
        console.error('Error fetching today data:', todayTrackingData.reason);
      }

      // Handle analytics data
      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      } else {
        console.error('Error fetching analytics:', analyticsData.reason);
      }

      // Handle tip of the day
      if (tipData.status === 'fulfilled') {
        setTipOfTheDay(tipData.value);
      } else {
        console.error('Error fetching tip:', tipData.reason);
      }

      // Handle quiz data
      if (quizQuestionData.status === 'fulfilled') {
        setQuizData(quizQuestionData.value);
      } else {
        console.error('Error fetching quiz:', quizQuestionData.reason);
      }

      // Handle consultations data
      if (consultationsData.status === 'fulfilled') {
        setConsultations(consultationsData.value.data || []);
      } else {
        console.error('Error fetching consultations:', consultationsData.reason);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = (profile: UserProfile) => {
    if (profile.health_profile?.height && profile.health_profile?.weight) {
      const height = profile.health_profile.height / 100; // Convert cm to m
      const weight = profile.health_profile.weight;
      const bmi = weight / (height * height);
      
      let category = '';
      let color = '';
      
      if (bmi < 18.5) {
        category = 'Underweight';
        color = 'text-blue-600';
      } else if (bmi < 25) {
        category = 'Normal';
        color = 'text-green-600';
      } else if (bmi < 30) {
        category = 'Overweight';
        color = 'text-yellow-600';
      } else {
        category = 'Obese';
        color = 'text-red-600';
      }
      
      setBmiStatus({
        value: Math.round(bmi * 10) / 10,
        category,
        color
      });
    }
  };

  const handleQuizAnswer = async (answerIndex: number) => {
    if (!quizData) return;
    
    setQuizAnswer(answerIndex);
    
    try {
      const result = await quizService.submitAnswer({
        user_answer: answerIndex,
        correct_answer: quizData.correct_answer
      });
      setQuizResult(result);
    } catch (error) {
      console.error('Error submitting quiz answer:', error);
      setQuizResult({
        is_correct: false,
        message: 'Error submitting answer'
      });
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const renderProgressRing = (percentage: number, colorClass: string, size: number = 80) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`${colorClass} transition-all duration-300 ease-in-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${colorClass}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return <Sun className="h-5 w-5" />;
      case 'lunch': return <Utensils className="h-5 w-5" />;
      case 'dinner': return <Moon className="h-5 w-5" />;
      case 'snacks': return <Coffee className="h-5 w-5" />;
      default: return <Utensils className="h-5 w-5" />;
    }
  };

  // Sidebar items
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'diet-plan', label: 'AI Diet Plan', icon: Brain },
    { id: 'goal-tracker', label: 'Goal Tracker', icon: Target },
    { id: 'consultations', label: 'Consultations', icon: Calendar },
    { id: 'education', label: 'Education Hub', icon: BookOpen },
    { id: 'chatbot', label: 'NutriBot', icon: MessageCircle },
    { id: 'profile', label: 'Profile & Settings', icon: User }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAllDashboardData}
            className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-300"
          >
            Retry
          </button>
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-8 lg:mb-0">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm mr-4">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                  Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
                </h1>
              </div>
              <p className="text-lg sm:text-xl text-green-100 max-w-2xl">
                Continue your journey to better health and nutrition with personalized insights
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="text-right">
                <p className="text-green-100 text-sm">Member since {user?.created_at ? new Date(user.created_at).getFullYear() : 'N/A'}</p>
                <p className="text-green-100 text-sm">ID: {user?.id}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={fetchAllDashboardData}
                  className="bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
                  title="Refresh data"
                >
                  <Loader className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button className="bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm">
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Back to Home Button - All Screen Sizes */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-3 rounded-xl shadow-lg border border-gray-200 hover:bg-white transition-all duration-300"
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            <span className="font-medium">Back to Home</span>
          </button>
        </div>

        {/* Sidebar and Main Content Container */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:w-80">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm">
              <div className="space-y-3">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'overview') {
                        setActiveSection('overview');
                      } else if (item.id === 'diet-plan') {
                        onNavigate('ai-diet-plan');
                      } else if (item.id === 'goal-tracker') {
                        onNavigate('goal-tracker');
                      } else if (item.id === 'consultations') {
                        onNavigate('consultations');
                      } else if (item.id === 'education') {
                        onNavigate('education-hub');
                      } else if (item.id === 'chatbot') {
                        onNavigate('chatbot');
                      } else if (item.id === 'profile') {
                        setActiveSection('profile');
                      }
                    }}
                    className={`w-full flex items-center px-4 py-4 text-left rounded-xl transition-all duration-300 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                    {activeSection === item.id && (
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 pb-20 lg:pb-0">
            {activeSection === 'overview' ? (
              <div className="space-y-8">
                {/* Health Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* BMI Status */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">BMI Status</h3>
                      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-2 rounded-lg">
                        <Scale className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    {todayData?.latest_weight_log?.bmi ? (
                      <div className="text-center">
                        {(() => {
                          const bmi = todayData.latest_weight_log.bmi;
                          let category = '';
                          let color = '';
                          
                          if (bmi < 18.5) {
                            category = 'Underweight';
                            color = 'text-blue-600';
                          } else if (bmi < 25) {
                            category = 'Normal';
                            color = 'text-green-600';
                          } else if (bmi < 30) {
                            category = 'Overweight';
                            color = 'text-yellow-600';
                          } else {
                            category = 'Obese';
                            color = 'text-red-600';
                          }
                          
                          return (
                            <>
                              <div className={`text-3xl font-bold ${color} mb-2`}>
                                {bmi}
                              </div>
                              <p className={`text-sm font-medium ${color}`}>
                                {category}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                From latest weight log
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    ) : bmiStatus ? (
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${bmiStatus.color} mb-2`}>
                          {bmiStatus.value}
                        </div>
                        <p className={`text-sm font-medium ${bmiStatus.color}`}>
                          {bmiStatus.category}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          From profile data
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-500">Add height & weight in profile</p>
                        <button 
                          onClick={() => setActiveSection('profile')}
                          className="text-green-600 text-sm mt-2 hover:underline"
                        >
                          Update Profile
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Weight Progress */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Weight Progress</h3>
                      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-2 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    {analytics?.weight_trend ? (
                      <div className="text-center">
                        <div className={`text-2xl font-bold mb-2 ${
                          analytics.weight_trend.total_change < 0 ? 'text-green-600' : 
                          analytics.weight_trend.total_change > 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {analytics.weight_trend.total_change > 0 ? '+' : ''}
                          {analytics.weight_trend.total_change}kg
                        </div>
                        <p className="text-sm text-gray-600">This week</p>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500">Start tracking weight</p>
                    )}
                  </div>

                  {/* Daily Calories */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Daily Calories</h3>
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-lg">
                        <Flame className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-2">
                        {todayData?.total_calories_burned || 0}
                      </div>
                      <p className="text-sm text-gray-600">Burned today</p>
                    </div>
                  </div>
                </div>

                {/* Today's Meal Plan */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Today's Meal Plan</h3>
                    <button 
                      onClick={() => onNavigate('goal-tracker')}
                      className="flex items-center bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-300 shadow-lg"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {todayData?.meals?.map((meal, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-2 rounded-lg mr-3">
                              {getMealIcon(meal.meal_type)}
                            </div>
                            <span className="font-medium text-gray-900 capitalize">
                              {meal.meal_type}
                            </span>
                          </div>
                          {meal.completed ? (
                            <div className="bg-green-100 p-2 rounded-full">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {meal.completed ? (
                            <span className="text-green-600 font-medium">Completed</span>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </div>
                      </div>
                    )) || (
                      <div className="col-span-4 text-center text-gray-500 py-8">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Utensils className="h-8 w-8 text-white" />
                        </div>
                        <p>No meal data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Trackers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Water Intake */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Water Intake</h4>
                    {renderProgressRing(
                      getProgressPercentage(
                        todayData?.water_intake?.glasses || 0, 
                        todayData?.water_intake?.goal || 8
                      ), 
                      'text-cyan-500', 
                      120
                    )}
                    <div className="mt-4">
                      <p className="text-2xl font-bold text-cyan-600">
                        {todayData?.water_intake?.glasses || 0} of {todayData?.water_intake?.goal || 8} glasses
                      </p>
                    </div>
                  </div>

                  {/* Exercise */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Exercise</h4>
                    {renderProgressRing(
                      getProgressPercentage(todayData?.total_exercise_minutes || 0, 60), 
                      'text-green-500', 
                      120
                    )}
                    <div className="mt-4">
                      <p className="text-2xl font-bold text-green-600">
                        {todayData?.total_exercise_minutes || 0} of 60 minutes
                      </p>
                    </div>
                  </div>

                  {/* Diet Adherence */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Diet Adherence</h4>
                    {renderProgressRing(
                      analytics?.meal_completion_rate || 75, 
                      'text-orange-500', 
                      120
                    )}
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">This week's average</p>
                    </div>
                  </div>
                </div>

                {/* AI Tip of the Day */}
                {tipOfTheDay && (
                  <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-full"></div>
                      <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-full"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center mb-4">
                        <div className="bg-white/20 p-2 rounded-lg mr-3 backdrop-blur-sm">
                          <Brain className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">AI Tip of the Day</h3>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold mb-2">{tipOfTheDay.title}</h4>
                        <p className="mb-3">{tipOfTheDay.tip}</p>
                        {tipOfTheDay.benefits && (
                          <p className="text-green-100">
                            <strong>Why it helps:</strong> {tipOfTheDay.benefits}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                          {tipOfTheDay.category}
                        </span>
                        <span className="text-sm">Difficulty: {tipOfTheDay.difficulty}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Nutrition Quiz */}
                {quizData && (
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Nutrition Quiz</h3>
                    <div className="mb-4">
                      <p className="text-gray-800 mb-4">{quizData.question}</p>
                      <div className="space-y-2">
                        {quizData.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuizAnswer(index)}
                            disabled={quizAnswer !== null}
                            className={`w-full p-3 text-left rounded-lg border transition-colors ${
                              quizAnswer === index
                                ? quizResult?.is_correct
                                  ? 'bg-green-100 border-green-500'
                                  : 'bg-red-100 border-red-500'
                                : quizAnswer !== null && index === quizData.correct_answer
                                ? 'bg-green-100 border-green-500'
                                : 'border-gray-300 hover:bg-gray-50'
                            } ${quizAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    {quizResult && (
                      <div className={`p-3 rounded-lg ${
                        quizResult.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <p className="font-medium">{quizResult.message}</p>
                      </div>
                    )}
                    {quizAnswer !== null && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-800">{quizData.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Profile Section */
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {sidebarItems.find(item => item.id === activeSection)?.label}
                  </h2>
                  {activeSection === 'profile' ? (
                    <>
                      <p className="text-gray-600 mb-6">
                        Manage your personal information, account security, and preferences.
                      </p>
                      <button
                        onClick={() => onNavigate('profile-settings')}
                        className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-300 shadow-lg"
                      >
                        Go to Profile Settings
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-600">This section is coming soon!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating macOS Style Bottom Bar - Mobile Only */}
      <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl px-2 py-3">
          <div className="flex items-center space-x-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'overview') {
                    setActiveSection('overview');
                  } else if (item.id === 'diet-plan') {
                    onNavigate('ai-diet-plan');
                  } else if (item.id === 'goal-tracker') {
                    onNavigate('goal-tracker');
                  } else if (item.id === 'consultations') {
                    onNavigate('consultations');
                  } else if (item.id === 'education') {
                    onNavigate('education-hub');
                  } else if (item.id === 'chatbot') {
                    onNavigate('chatbot');
                  } else if (item.id === 'profile') {
                    setActiveSection('profile');
                  }
                }}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                  activeSection === item.id
                    ? 'text-green-600 bg-green-50 shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`h-6 w-6 ${
                  activeSection === item.id ? 'text-green-600' : 'text-gray-500'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
