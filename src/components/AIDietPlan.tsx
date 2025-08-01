import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Check, User, Target, Activity, Utensils,
  Heart, Scale, Dumbbell, Zap, Apple, Coffee, Sun, Moon,
  ChevronLeft, ChevronRight, RefreshCw, Share2, ShoppingCart,
  Calendar, Clock, TrendingUp, BarChart3, Edit, Save, X,
  Plus, Minus, Star, BookOpen, AlertCircle, Loader
} from 'lucide-react';
import dietPlanService from '../services/dietPlanService';
import type { DietPlan } from '../services/dietPlanService';

interface AIDietPlanProps {
  onNavigate: (page: string) => void;
  userName: string;
}

const AIDietPlan = ({ onNavigate, userName }: AIDietPlanProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [generatedPlan, setGeneratedPlan] = useState<DietPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Basics
    age: 28,
    gender: 'female',
    weight: 68,
    height: 165,
    // Step 2: Goals
    primaryGoal: '',
    targetWeight: 60,
    timeframe: '3-months',
    // Step 3: Activity
    activityLevel: '',
    exerciseFrequency: '',
    // Step 4: Preferences
    dietaryPreferences: [] as string[],
    dislikes: [] as string[],
    allergies: [] as string[],
    medications: '',
    // Step 5: Health
    healthConditions: [] as string[]
  });

  const steps = [
    { title: 'Basics', icon: User },
    { title: 'Goals', icon: Target },
    { title: 'Activity', icon: Activity },
    { title: 'Preferences', icon: Utensils },
    { title: 'Health', icon: Heart }
  ];

  const generateDietPlan = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      console.log('Starting diet plan generation...');
      const plan = await dietPlanService.generateDietPlan(formData);
      console.log('Diet plan received:', plan);
      
      setGeneratedPlan(plan);
      setShowPlan(true);
      
      console.log('State updated - showPlan:', true, 'generatedPlan:', plan);
    } catch (error) {
      console.error('Error generating diet plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate diet plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateDietPlan();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? prev[field as keyof typeof prev].filter((item: string) => item !== value)
        : [...prev[field as keyof typeof prev], value]
    }));
  };

  // Debug logging
  console.log('Component state:', { isGenerating, showPlan, generatedPlan: !!generatedPlan, error });

  // Loading screen during AI generation
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-green-200 rounded-full animate-spin border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Apple className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Creating Your Perfect Diet Plan</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <Loader className="animate-spin h-4 w-4 mr-3 text-green-600" />
              <span>🧠 Analyzing your preferences...</span>
            </div>
            <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <Loader className="animate-spin h-4 w-4 mr-3 text-green-600" />
              <span>⚖️ Balancing your macronutrients...</span>
            </div>
            <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <Loader className="animate-spin h-4 w-4 mr-3 text-green-600" />
              <span>🍽️ Crafting personalized meals...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show generated plan
  if (showPlan && generatedPlan) {
    const currentDayPlan = generatedPlan.weekly_plan[selectedDay];
    
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-8 lg:mb-0">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm mr-4">
                    <Apple className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                    Personalized nutrition plan for {userName}
                  </h1>
                </div>
                <p className="text-lg sm:text-xl text-green-100 max-w-2xl">
                  {generatedPlan.plan_summary.daily_calories} calories - 7-day meal plan
                </p>
              </div>
              
              <button
                onClick={() => setShowPlan(false)}
                className="bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm self-start lg:self-auto"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Nutrition Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">{generatedPlan.plan_summary.daily_calories}</div>
                <div className="text-gray-600 font-medium">Daily Calories</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{generatedPlan.plan_summary.protein_grams}g</div>
                <div className="text-gray-600 font-medium">Protein</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{generatedPlan.plan_summary.carbs_grams}g</div>
                <div className="text-gray-600 font-medium">Carbs</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{generatedPlan.plan_summary.fat_grams}g</div>
                <div className="text-gray-600 font-medium">Fats</div>
              </div>
            </div>
          </div>

          {/* Day Navigation */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Weekly Meal Plan</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'daily' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Daily View
                </button>
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'weekly' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Weekly View
                </button>
              </div>
            </div>

            {/* Day selector */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {generatedPlan.weekly_plan.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={`px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-300 ${
                    selectedDay === index 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {day.day_name}
                </button>
              ))}
            </div>

            {viewMode === 'daily' && currentDayPlan && (
              <div>
                <h3 className="text-xl font-semibold mb-4">{currentDayPlan.day_name}</h3>
                
                {/* Meals */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(currentDayPlan.meals).map(([mealType, meal]) => (
                    <div key={mealType} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <h4 className="font-semibold text-lg mb-3 capitalize text-green-600">
                        {mealType.replace('_', ' ')}
                      </h4>
                      <h5 className="font-medium text-gray-800 mb-3 text-lg">{meal.name}</h5>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <div className="flex justify-between">
                          <span>Calories:</span>
                          <span>{meal.calories}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protein:</span>
                          <span>{meal.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prep time:</span>
                          <span>{meal.preparation_time}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Ingredients:</p>
                        <p className="text-sm text-gray-600">{meal.ingredients.join(', ')}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Instructions:</p>
                        <p className="text-sm text-gray-600">{meal.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Daily tip */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mt-6 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="text-2xl mr-2">💡</span>
                    Daily Tip
                  </h4>
                  <p className="text-green-700 leading-relaxed">{currentDayPlan.daily_tips}</p>
                </div>
              </div>
            )}

            {viewMode === 'weekly' && (
              <div>
                <p className="text-center text-gray-600 py-8">
                  Weekly meal planning view coming soon!
                </p>
              </div>
            )}
          </div>

          {/* Shopping List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-2 rounded-lg mr-3">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                Shopping List
              </h3>
              
              {Object.entries(generatedPlan.shopping_list).map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3 capitalize text-lg">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200"
                      >
                        {typeof item === 'string' ? item : `${item.name || 'Unknown item'}${item.quantity && item.quantity !== 'undefined' ? ` (${item.quantity})` : ''}`}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips & Suggestions */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-2 rounded-lg mr-3">
                    <span className="text-white text-lg">💡</span>
                  </div>
                  Nutrition Tips
                </h3>
                <ul className="space-y-3">
                  {generatedPlan.nutrition_tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-lg mr-3">
                    <span className="text-white text-lg">🍱</span>
                  </div>
                  Meal Prep Tips
                </h3>
                <ul className="space-y-3">
                  {generatedPlan.meal_prep_suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-orange-100 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                        <Star className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-gray-700 leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
            <button 
              onClick={generateDietPlan}
              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-8 py-4 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Generate New Plan
            </button>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105">
              <Share2 className="h-5 w-5 mr-2" />
              Share Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form steps
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
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 text-center">
          <button
            onClick={() => onNavigate('dashboard')}
            className="absolute left-6 top-6 text-white hover:text-green-200 transition-colors bg-white/20 p-2 rounded-xl backdrop-blur-sm"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm inline-block mb-6">
            <Apple className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">AI Diet Plan Generator</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Get a personalized nutrition plan powered by AI, tailored to your health goals and preferences.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  index <= currentStep ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-gray-600 font-medium">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          {/* Step 1: Basics */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Let's start with the basics</h2>
              <p className="text-gray-600 mb-8">We'll use your profile information to create the perfect plan</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="flex space-x-4">
                    {['male', 'female', 'other'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleInputChange('gender', option)}
                        className={`px-4 py-3 rounded-xl capitalize transition-all duration-300 ${
                          formData.gender === option
                            ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">What's your primary goal?</h2>
              <p className="text-gray-600 mb-8">Choose the goal that matters most to you right now</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { id: 'weight_loss', title: 'Lose Weight', icon: '⚖️', desc: 'Shed those extra pounds safely' },
                  { id: 'weight_gain', title: 'Gain Weight', icon: '💪', desc: 'Build healthy mass and muscle' },
                  { id: 'maintain', title: 'Maintain Weight', icon: '⚖️', desc: 'Stay at your current weight' },
                  { id: 'muscle_gain', title: 'Build Muscle', icon: '🏋️', desc: 'Increase lean muscle mass' },
                  { id: 'general_health', title: 'General Health', icon: '🌟', desc: 'Improve overall wellness' },
                  { id: 'disease_management', title: 'Disease Management', icon: '🏥', desc: 'Manage health conditions' }
                ].map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleInputChange('primaryGoal', goal.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
                      formData.primaryGoal === goal.id
                        ? 'border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <h3 className="font-semibold mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.desc}</p>
                  </button>
                ))}
              </div>

              {(formData.primaryGoal === 'weight_loss' || formData.primaryGoal === 'weight_gain') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.targetWeight}
                      onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                    <select
                      value={formData.timeframe}
                      onChange={(e) => handleInputChange('timeframe', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="1-month">1 Month</option>
                      <option value="3-months">3 Months</option>
                      <option value="6-months">6 Months</option>
                      <option value="1-year">1 Year</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Activity */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tell us about your activity level</h2>
              <p className="text-gray-600 mb-8">This helps us calculate your calorie needs accurately</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Daily Activity Level</label>
                  <div className="space-y-3">
                    {[
                      { id: 'sedentary', title: 'Sedentary', desc: 'Little to no exercise, desk job' },
                      { id: 'light', title: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                      { id: 'moderate', title: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                      { id: 'active', title: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
                      { id: 'very_active', title: 'Extremely Active', desc: 'Very hard exercise, physical job' }
                    ].map((level) => (
                      <button
                        key={level.id}
                        onClick={() => handleInputChange('activityLevel', level.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-md ${
                          formData.activityLevel === level.id
                            ? 'border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold">{level.title}</div>
                        <div className="text-sm text-gray-600">{level.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Exercise Frequency</label>
                  <div className="space-y-3">
                    {[
                      { id: 'never', title: 'Never', desc: 'No regular exercise' },
                      { id: '1-2', title: '1-2 times/week', desc: 'Minimal exercise' },
                      { id: '3-4', title: '3-4 times/week', desc: 'Regular exercise' },
                      { id: '5-6', title: '5-6 times/week', desc: 'Very regular exercise' },
                      { id: 'daily', title: 'Daily', desc: 'Exercise every day' }
                    ].map((freq) => (
                      <button
                        key={freq.id}
                        onClick={() => handleInputChange('exerciseFrequency', freq.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-md ${
                          formData.exerciseFrequency === freq.id
                            ? 'border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold">{freq.title}</div>
                        <div className="text-sm text-gray-600">{freq.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Food preferences and restrictions</h2>
              <p className="text-gray-600 mb-8">This helps us create a plan you'll love to follow</p>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Dietary Preferences (select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      'vegetarian', 'vegan', 'pescatarian', 'keto', 
                      'paleo', 'mediterranean', 'low_carb', 'gluten_free',
                      'dairy_free', 'low_sodium', 'high_protein', 'balanced'
                    ].map((pref) => (
                      <button
                        key={pref}
                        onClick={() => handleArrayToggle('dietaryPreferences', pref)}
                        className={`p-4 rounded-xl border text-sm capitalize transition-all duration-300 hover:shadow-md ${
                          formData.dietaryPreferences.includes(pref)
                            ? 'border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pref.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Food Allergies</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      'nuts', 'shellfish', 'dairy', 'eggs', 
                      'soy', 'wheat', 'fish', 'sesame'
                    ].map((allergy) => (
                      <button
                        key={allergy}
                        onClick={() => handleArrayToggle('allergies', allergy)}
                        className={`p-4 rounded-xl border text-sm capitalize transition-all duration-300 hover:shadow-md ${
                          formData.allergies.includes(allergy)
                            ? 'border-red-600 bg-gradient-to-r from-red-50 to-pink-50 text-red-800 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {allergy}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Foods you dislike</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      'broccoli', 'spinach', 'mushrooms', 'onions',
                      'tomatoes', 'spicy_food', 'seafood', 'beans'
                    ].map((dislike) => (
                      <button
                        key={dislike}
                        onClick={() => handleArrayToggle('dislikes', dislike)}
                        className={`p-4 rounded-xl border text-sm capitalize transition-all duration-300 hover:shadow-md ${
                          formData.dislikes.includes(dislike)
                            ? 'border-orange-600 bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-800 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {dislike.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Health */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Health information</h2>
              <p className="text-gray-600 mb-8">This helps us create a safe and effective plan for you</p>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Health Conditions (select all that apply)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'diabetes', 'hypertension', 'heart_disease', 'high_cholesterol',
                      'thyroid_issues', 'pcos', 'ibs', 'food_intolerance',
                      'kidney_disease', 'liver_disease', 'osteoporosis', 'none'
                    ].map((condition) => (
                      <button
                        key={condition}
                        onClick={() => handleArrayToggle('healthConditions', condition)}
                        className={`p-4 rounded-xl border text-sm text-left capitalize transition-all duration-300 hover:shadow-md ${
                          formData.healthConditions.includes(condition)
                            ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {condition.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications (optional)</label>
                  <textarea
                    value={formData.medications}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    placeholder="List any medications you're currently taking..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Important Disclaimer</p>
                      <p>This plan is for informational purposes and is not a substitute for medical advice. Please consult your doctor before making significant dietary changes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center justify-center px-6 py-3 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 0 && (!formData.age || !formData.gender || !formData.weight || !formData.height)) ||
                (currentStep === 1 && !formData.primaryGoal) ||
                (currentStep === 2 && (!formData.activityLevel || !formData.exerciseFrequency))
              }
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {currentStep === steps.length - 1 ? 'Generate My Plan' : 'Next'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDietPlan;
