from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import json
import logging
from typing import Dict, Any
from utils.security import verify_token
from utils.groq_client import get_groq_client

router = APIRouter(prefix="/quiz", tags=["Quiz"])
security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get shared Groq client
client = get_groq_client()

@router.get("/tip-of-the-day")
async def generate_tip_of_the_day():
    """Generate an AI-powered nutrition tip of the day"""
    try:
        # Create a prompt for nutrition tips
        prompt = """Generate a single nutrition and health tip of the day with the following JSON format:
        {
            "title": "A catchy, short title for the tip (max 50 characters)",
            "tip": "A practical, actionable nutrition or health tip that users can implement today",
            "category": "One of: Nutrition, Hydration, Exercise, Sleep, Mental Health, or General Wellness",
            "difficulty": "Easy, Moderate, or Advanced",
            "benefits": "Brief explanation of why this tip is beneficial (1-2 sentences)"
        }
        
        Make sure the tip is:
        - Practical and actionable
        - Related to nutrition, diet, wellness, or healthy lifestyle
        - Something users can implement today
        - Motivational and positive
        - Based on sound health principles
        - Suitable for general audience
        
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
        )

        # Parse the response
        response_content = chat_completion.choices[0].message.content.strip()
        
        # Try to extract JSON from the response
        try:
            # Remove any potential markdown formatting
            if response_content.startswith("```json"):
                response_content = response_content.replace("```json", "").replace("```json", "").replace("```", "")
            elif response_content.startswith("```"):
                response_content = response_content.replace("```","")
            
            tip_data = json.loads(response_content)
            
            # Validate the required fields
            required_fields = ["title", "tip", "category", "difficulty", "benefits"]
            if not all(field in tip_data for field in required_fields):
                raise ValueError("Missing required fields in tip data")
            
            logger.info("Tip of the day generated successfully")
            return tip_data
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse tip response: {str(e)}")
            # Fallback tip
            return {
                "title": "Stay Hydrated Throughout the Day",
                "tip": "Start your morning with a glass of water and keep a water bottle nearby to remind yourself to drink regularly throughout the day.",
                "category": "Hydration",
                "difficulty": "Easy",
                "benefits": "Proper hydration improves energy levels, supports brain function, and helps maintain healthy skin."
            }

    except Exception as e:
        logger.error(f"Tip generation error: {str(e)}")
        # Return fallback tip
        return {
            "title": "Eat the Rainbow",
            "tip": "Include at least 3 different colored fruits or vegetables in your meals today - red tomatoes, orange carrots, and green spinach!",
            "category": "Nutrition",
            "difficulty": "Easy",
            "benefits": "Different colored produce provides various vitamins, minerals, and antioxidants essential for optimal health."
        }

@router.get("/generate-question")
async def generate_quiz_question(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Generate an AI-powered nutrition quiz question"""
    try:
        # Verify token (optional - remove if you want public access)
        email = verify_token(credentials.credentials)
        
        # Create a prompt for nutrition-related quiz questions
        prompt = """Generate a single nutrition and health quiz question with the following JSON format:
        {
            "question": "A clear, educational question about nutrition, diet, or health",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0,
            "explanation": "A brief explanation of why this answer is correct and educational information"
        }
        
        Make sure the question is:
        - Educational and informative
        - Related to nutrition, diet, wellness, or healthy lifestyle
        - Not too difficult but engaging
        - Suitable for people interested in improving their health
        
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
        )

        # Parse the response
        response_content = chat_completion.choices[0].message.content.strip()
        
        # Try to extract JSON from the response
        try:
            # Remove any potential markdown formatting
            if response_content.startswith("```json"):
                response_content = response_content.replace("```json", "").replace("```json", "").replace("```", "")
            elif response_content.startswith("```"):
                response_content = response_content.replace("```","")
            
            quiz_data = json.loads(response_content)
            
            # Validate the required fields
            required_fields = ["question", "options", "correct_answer", "explanation"]
            if not all(field in quiz_data for field in required_fields):
                raise ValueError("Missing required fields in quiz data")
            
            if len(quiz_data["options"]) != 4:
                raise ValueError("Quiz must have exactly 4 options")
            
            logger.info("Quiz question generated successfully")
            return quiz_data
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse quiz response: {str(e)}")
            # Fallback quiz question
            return {
                "question": "Which nutrient is most important for building and repairing muscles?",
                "options": ["Carbohydrates", "Protein", "Fats", "Vitamins"],
                "correct_answer": 1,
                "explanation": "Protein is essential for building and repairing muscle tissue. It provides amino acids that serve as building blocks for muscle fibers."
            }

    except Exception as e:
        logger.error(f"Quiz generation error: {str(e)}")
        # Return fallback quiz question
        return {
            "question": "How many glasses of water should an average adult drink per day?",
            "options": ["4-5 glasses", "6-7 glasses", "8-10 glasses", "12+ glasses"],
            "correct_answer": 2,
            "explanation": "Most health experts recommend 8-10 glasses (about 2-2.5 liters) of water per day for proper hydration and optimal body function."
        }

@router.post("/submit-answer")
async def submit_quiz_answer(
    answer_data: Dict[str, Any],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Submit quiz answer and get feedback"""
    try:
        # Verify token (optional)
        email = verify_token(credentials.credentials)
        
        user_answer = answer_data.get("user_answer")
        correct_answer = answer_data.get("correct_answer")
        
        is_correct = user_answer == correct_answer
        
        logger.info(f"Quiz answer submitted: {is_correct}")
        return {
            "is_correct": is_correct,
            "message": "Correct! Great job!" if is_correct else "Not quite right, but keep learning!"
        }
        
    except Exception as e:
        logger.error(f"Submit answer error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing quiz answer"
        )
