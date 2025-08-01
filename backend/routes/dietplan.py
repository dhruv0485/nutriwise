from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime  
import json
import logging
from typing import Dict, Any, List
from utils.security import verify_token
from utils.groq_client import get_groq_client

router = APIRouter(prefix="/dietplan", tags=["Diet Plan"])
security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get shared Groq client
client = get_groq_client()

@router.post("/generate")
async def generate_diet_plan(
    plan_data: Dict[str, Any],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Generate AI-powered personalized diet plan"""
    try:
        # Verify token
        email = verify_token(credentials.credentials)
        
        # Extract user data
        age = plan_data.get('age', 25)
        gender = plan_data.get('gender', 'female')
        weight = plan_data.get('weight', 70)
        height = plan_data.get('height', 170)
        activity_level = plan_data.get('activityLevel', 'moderate')
        primary_goal = plan_data.get('primaryGoal', 'weight_loss')
        target_weight = plan_data.get('targetWeight', 65)
        dietary_preferences = plan_data.get('dietaryPreferences', [])
        allergies = plan_data.get('allergies', [])
        health_conditions = plan_data.get('healthConditions', [])
        
        # Calculate BMI and daily calorie needs
        bmi = weight / ((height/100) ** 2)
        
        # Activity multipliers
        activity_multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        }
        
        # Calculate BMR (Basal Metabolic Rate)
        if gender.lower() == 'male':
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        
        # Calculate daily calories
        multiplier = activity_multipliers.get(activity_level, 1.55)
        maintenance_calories = int(bmr * multiplier)
        
        # Adjust calories based on goal
        if primary_goal == 'weight_loss':
            daily_calories = maintenance_calories - 500
        elif primary_goal == 'weight_gain':
            daily_calories = maintenance_calories + 500
        else:
            daily_calories = maintenance_calories

        # Create comprehensive prompt for Groq AI
        prompt = f"""You are a professional nutritionist and chef. Generate a CREATIVE, personalized 7-day diet plan in JSON format for:

**User Profile:**
- Age: {age}, Gender: {gender}
- Current Weight: {weight}kg, Height: {height}cm
- BMI: {bmi:.1f}
- Activity Level: {activity_level}
- Primary Goal: {primary_goal}
- Target Weight: {target_weight}kg
- Daily Calories: {daily_calories}
- Dietary Preferences: {', '.join(dietary_preferences) if dietary_preferences else 'None'}
- Allergies: {', '.join(allergies) if allergies else 'None'}
- Health Conditions: {', '.join(health_conditions) if health_conditions else 'None'}

**Required JSON Structure:**
{{
  "plan_summary": {{
    "daily_calories": {daily_calories},
    "protein_grams": 120,
    "carbs_grams": 200,
    "fat_grams": 65,
    "fiber_grams": 25,
    "water_glasses": 8
  }},
  "weekly_plan": [
    {{
      "day": 1,
      "day_name": "Monday",
      "meals": {{
        "breakfast": {{
          "name": "Meal Name",
          "ingredients": ["ingredient1", "ingredient2"],
          "calories": 350,
          "protein": 20,
          "carbs": 40,
          "fat": 12,
          "preparation_time": "15 min",
          "instructions": "Brief cooking instructions"
        }},
        "morning_snack": {{
          "name": "Snack Name",
          "ingredients": ["ingredient1"],
          "calories": 150,
          "protein": 8,
          "carbs": 20,
          "fat": 5,
          "preparation_time": "5 min",
          "instructions": "Simple preparation"
        }},
        "lunch": {{
          "name": "Meal Name",
          "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
          "calories": 450,
          "protein": 25,
          "carbs": 50,
          "fat": 18,
          "preparation_time": "25 min",
          "instructions": "Cooking instructions"
        }},
        "afternoon_snack": {{
          "name": "Snack Name",
          "ingredients": ["ingredient1"],
          "calories": 120,
          "protein": 6,
          "carbs": 15,
          "fat": 4,
          "preparation_time": "5 min",
          "instructions": "Simple preparation"
        }},
        "dinner": {{
          "name": "Meal Name",
          "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
          "calories": 400,
          "protein": 30,
          "carbs": 35,
          "fat": 15,
          "preparation_time": "30 min",
          "instructions": "Detailed cooking steps"
        }}
      }},
      "total_calories": 1470,
      "daily_tips": "Helpful tip for the day"
    }}
  ],
  "shopping_list": {{
    "proteins": ["chicken breast", "eggs", "greek yogurt"],
    "vegetables": ["spinach", "broccoli", "tomatoes"],
    "fruits": ["apples", "berries", "bananas"],
    "grains": ["oats", "quinoa", "brown rice"],
    "dairy": ["milk", "cheese"],
    "others": ["olive oil", "nuts", "herbs"]
  }},
  "nutrition_tips": [
    "Stay hydrated with 8-10 glasses of water daily",
    "Include protein in every meal for satiety",
    "Eat vegetables first to increase fiber intake"
  ],
  "meal_prep_suggestions": [
    "Prepare overnight oats for quick breakfasts",
    "Cook grains in batches for the week",
    "Pre-cut vegetables for easy cooking"
  ]
}}

**CRITICAL CREATIVITY REQUIREMENTS:**
- Use CREATIVE, DESCRIPTIVE meal names (NOT generic like "Greek Yogurt Bowl" or "Apple Slices")
- Include DIVERSE cuisines (Mediterranean, Asian, Mexican, Indian, etc.)
- Use VARIED ingredients across all 7 days
- Create INTERESTING flavor combinations
- Make shopping lists SPECIFIC with quantities
- Provide DETAILED, HELPFUL tips and suggestions

**Important Guidelines:**
- Create exactly 7 days of meals
- Ensure meals align with dietary preferences and avoid allergies
- Balance macronutrients appropriately
- Include variety and realistic portions
- Provide practical cooking instructions
- Consider the user's goal ({primary_goal})
- Make meals culturally appropriate and accessible
- Include healthy snacks between main meals

**CREATIVITY EXAMPLES:**
- Instead of "Greek Yogurt Bowl" use "Moroccan Spiced Shakshuka with Feta"
- Instead of "Apple Slices" use "Cinnamon-Spiced Apple Chips with Almond Butter"
- Instead of "Chicken Salad" use "Thai-Inspired Grilled Chicken with Mango Salsa"

Create 7 COMPLETE days with DIFFERENT meals each day. Be CREATIVE and SPECIFIC.

Return only the JSON object, no additional text."""

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            stream=False,
            temperature=0.7,
            max_tokens=8000,  # Increased token limit for complete JSON
        )

        # Parse the response
        response_content = chat_completion.choices[0].message.content.strip()
        logger.info(f"AI Response received: {response_content[:200]}...")
        
        try:
            # Remove any potential markdown formatting
            if response_content.startswith("```json"):
                response_content = response_content.replace("```json", "").replace("```json", "").replace("```", "")
            elif response_content.startswith("```"):
                response_content = response_content.replace("```","")
            
            # Clean up the response
            response_content = response_content.strip()
            
            # Try to fix truncated JSON by finding the last complete object
            if response_content.count('{') > response_content.count('}'):
                # JSON is truncated, try to find the last complete object
                last_brace = response_content.rfind('}')
                if last_brace > 0:
                    response_content = response_content[:last_brace + 1]
                    logger.info("Fixed truncated JSON response")
            
            diet_plan = json.loads(response_content)
            
            # Validate the required structure
            required_fields = ["plan_summary", "weekly_plan", "shopping_list", "nutrition_tips", "meal_prep_suggestions"]
            missing_fields = [field for field in required_fields if field not in diet_plan]
            if missing_fields:
                logger.error(f"Missing required fields: {missing_fields}")
                raise ValueError("Invalid diet plan structure")
            
            # Validate weekly plan has at least some days (be more flexible)
            if not diet_plan.get("weekly_plan") or len(diet_plan["weekly_plan"]) < 3:
                logger.error(f"Weekly plan has {len(diet_plan.get('weekly_plan', []))} days, need at least 3")
                raise ValueError("Weekly plan must have at least 3 days")
            
            # If we have less than 7 days, pad with additional days
            if len(diet_plan["weekly_plan"]) < 7:
                logger.info(f"Padding diet plan from {len(diet_plan['weekly_plan'])} to 7 days")
                while len(diet_plan["weekly_plan"]) < 7:
                    # Copy the last day and modify it slightly
                    last_day = diet_plan["weekly_plan"][-1].copy()
                    last_day["day"] = len(diet_plan["weekly_plan"]) + 1
                    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                    last_day["day_name"] = day_names[len(diet_plan["weekly_plan"])]
                    diet_plan["weekly_plan"].append(last_day)
            
            # Add user metadata
            diet_plan["user_info"] = {
                "email": email,
                "bmi": round(bmi, 1),
                "goal": primary_goal,
                "generated_at": datetime.utcnow().isoformat()
            }
            
            logger.info("Diet plan generated successfully by AI")
            return diet_plan
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse diet plan response: {str(e)}")
            logger.error(f"Raw response: {response_content}")
            # Try to retry with a simpler prompt
            return await retry_with_simpler_prompt(plan_data, email, daily_calories, primary_goal, bmi)

    except Exception as e:
        logger.error(f"Diet plan generation error: {str(e)}")
        return get_fallback_diet_plan(1500, 'weight_loss')

async def retry_with_simpler_prompt(plan_data: Dict[str, Any], email: str, daily_calories: int, primary_goal: str, bmi: float):
    """Retry with a simpler prompt if the main one fails"""
    try:
        age = plan_data.get('age', 25)
        gender = plan_data.get('gender', 'female')
        dietary_preferences = plan_data.get('dietaryPreferences', [])
        allergies = plan_data.get('allergies', [])
        
        simpler_prompt = f"""Create a simple 7-day diet plan in JSON format for:
Age: {age}, Gender: {gender}, Calories: {daily_calories}, Goal: {primary_goal}
Dietary preferences: {dietary_preferences}
Allergies: {allergies}

Return a JSON object with this exact structure:
{{
  "plan_summary": {{
    "daily_calories": {daily_calories},
    "protein_grams": 120,
    "carbs_grams": 200,
    "fat_grams": 65,
    "fiber_grams": 25,
    "water_glasses": 8
  }},
  "weekly_plan": [
    {{
      "day": 1,
      "day_name": "Monday",
      "meals": {{
        "breakfast": {{
          "name": "Creative breakfast name",
          "ingredients": ["ingredient1", "ingredient2"],
          "calories": 350,
          "protein": 20,
          "carbs": 40,
          "fat": 12,
          "preparation_time": "15 min",
          "instructions": "Simple cooking instructions"
        }},
        "morning_snack": {{
          "name": "Creative snack name",
          "ingredients": ["ingredient1"],
          "calories": 150,
          "protein": 8,
          "carbs": 20,
          "fat": 5,
          "preparation_time": "5 min",
          "instructions": "Simple preparation"
        }},
        "lunch": {{
          "name": "Creative lunch name",
          "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
          "calories": 450,
          "protein": 25,
          "carbs": 50,
          "fat": 18,
          "preparation_time": "25 min",
          "instructions": "Cooking instructions"
        }},
        "afternoon_snack": {{
          "name": "Creative snack name",
          "ingredients": ["ingredient1"],
          "calories": 120,
          "protein": 6,
          "carbs": 15,
          "fat": 4,
          "preparation_time": "5 min",
          "instructions": "Simple preparation"
        }},
        "dinner": {{
          "name": "Creative dinner name",
          "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
          "calories": 400,
          "protein": 30,
          "carbs": 35,
          "fat": 15,
          "preparation_time": "30 min",
          "instructions": "Detailed cooking steps"
        }}
      }},
      "total_calories": 1470,
      "daily_tips": "Helpful tip for the day"
    }}
  ],
  "shopping_list": {{
    "proteins": ["protein1", "protein2", "protein3"],
    "vegetables": ["vegetable1", "vegetable2", "vegetable3"],
    "fruits": ["fruit1", "fruit2", "fruit3"],
    "grains": ["grain1", "grain2", "grain3"],
    "dairy": ["dairy1", "dairy2"],
    "others": ["other1", "other2", "other3"]
  }},
  "nutrition_tips": [
    "Tip 1",
    "Tip 2", 
    "Tip 3"
  ],
  "meal_prep_suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ]
}}

Create 7 days with different meals each day. Be creative with meal names and ingredients."""

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": simpler_prompt}],
            model="llama-3.3-70b-versatile",
            stream=False,
            temperature=0.8,
            max_tokens=6000,  # Increased token limit for retry
        )

        response_content = chat_completion.choices[0].message.content.strip()
        logger.info(f"Retry AI Response received: {response_content[:200]}...")
        
        # Clean up response
        if response_content.startswith("```json"):
            response_content = response_content.replace("```json", "").replace("```", "")
        elif response_content.startswith("```"):
            response_content = response_content.replace("```", "")
        
        response_content = response_content.strip()
        
        # Try to fix truncated JSON by finding the last complete object
        if response_content.count('{') > response_content.count('}'):
            # JSON is truncated, try to find the last complete object
            last_brace = response_content.rfind('}')
            if last_brace > 0:
                response_content = response_content[:last_brace + 1]
                logger.info("Fixed truncated JSON response in retry")
        
        diet_plan = json.loads(response_content)
        
        # Add user metadata
        diet_plan["user_info"] = {
            "email": email,
            "bmi": round(bmi, 1),
            "goal": primary_goal,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        logger.info("Diet plan generated successfully with retry")
        return diet_plan
        
    except Exception as e:
        logger.error(f"Retry failed: {str(e)}")
        return get_fallback_diet_plan(daily_calories, primary_goal)

def get_fallback_diet_plan(calories: int, goal: str):
    """Fallback diet plan if AI generation fails"""
    return {
        "plan_summary": {
            "daily_calories": calories,
            "protein_grams": 120,
            "carbs_grams": 180,
            "fat_grams": 60,
            "fiber_grams": 25,
            "water_glasses": 8
        },
        "weekly_plan": [
            {
                "day": 1,
                "day_name": "Monday",
                "meals": {
                    "breakfast": {
                        "name": "Greek Yogurt Bowl",
                        "ingredients": ["Greek yogurt", "berries", "granola", "honey"],
                        "calories": 350,
                        "protein": 20,
                        "carbs": 45,
                        "fat": 12,
                        "preparation_time": "5 min",
                        "instructions": "Mix Greek yogurt with berries and top with granola and honey"
                    },
                    "morning_snack": {
                        "name": "Apple with Almonds",
                        "ingredients": ["apple", "almonds"],
                        "calories": 150,
                        "protein": 6,
                        "carbs": 20,
                        "fat": 8,
                        "preparation_time": "2 min",
                        "instructions": "Slice apple and serve with a handful of almonds"
                    },
                    "lunch": {
                        "name": "Grilled Chicken Salad",
                        "ingredients": ["chicken breast", "mixed greens", "tomatoes", "cucumber", "olive oil"],
                        "calories": 400,
                        "protein": 35,
                        "carbs": 15,
                        "fat": 20,
                        "preparation_time": "20 min",
                        "instructions": "Grill chicken, serve over mixed greens with vegetables and olive oil dressing"
                    },
                    "afternoon_snack": {
                        "name": "Hummus with Veggies",
                        "ingredients": ["hummus", "carrots", "bell peppers"],
                        "calories": 120,
                        "protein": 5,
                        "carbs": 12,
                        "fat": 6,
                        "preparation_time": "3 min",
                        "instructions": "Cut vegetables and serve with hummus"
                    },
                    "dinner": {
                        "name": "Baked Salmon with Quinoa",
                        "ingredients": ["salmon fillet", "quinoa", "broccoli", "lemon"],
                        "calories": 450,
                        "protein": 35,
                        "carbs": 35,
                        "fat": 18,
                        "preparation_time": "30 min",
                        "instructions": "Bake salmon at 400°F for 15 min, serve with cooked quinoa and steamed broccoli"
                    }
                },
                "total_calories": 1470,
                "daily_tips": "Start your day with protein to boost metabolism and maintain energy levels"
            }
        ],
        "shopping_list": {
            "proteins": ["Greek yogurt", "chicken breast", "salmon", "almonds"],
            "vegetables": ["mixed greens", "tomatoes", "cucumber", "carrots", "bell peppers", "broccoli"],
            "fruits": ["berries", "apple", "lemon"],
            "grains": ["granola", "quinoa"],
            "others": ["honey", "olive oil", "hummus"]
        },
        "nutrition_tips": [
            "Drink water before meals to help with portion control",
            "Include a source of protein at each meal",
            "Aim for 5-7 servings of vegetables daily"
        ],
        "meal_prep_suggestions": [
            "Cook quinoa in batches for the week",
            "Pre-cut vegetables for easy snacking",
            "Marinate proteins the night before cooking"
        ]
    }

@router.get("/user-plans")
async def get_user_diet_plans(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user's saved diet plans"""
    try:
        email = verify_token(credentials.credentials)
        # In a real app, you'd fetch from database
        # For now, return empty array
        return {"plans": []}
    except Exception as e:
        logger.error(f"Error fetching user plans: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching diet plans"
        )
