from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import logging
from typing import Dict, Any, List
from datetime import datetime
from utils.security import verify_token
from utils.groq_client import get_groq_client

router = APIRouter(prefix="/myth", tags=["Myth"])
security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get shared Groq client
client = get_groq_client()

@router.get("/generate-myths")
async def generate_myth_facts(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Generate AI-powered myth vs fact cards"""
    try:
        # Verify token
        email = verify_token(credentials.credentials)
        
        import random
        
        # Create dynamic prompts with different focuses
        prompt_variations = [
            """Generate 4 unique nutrition myths focusing on WEIGHT LOSS misconceptions. Make them completely different from common myths about carbs, water, and fat. Focus on topics like meal timing, specific foods, exercise myths, or metabolism myths. Use this JSON format:

{
  "myths": [
    {
      "id": 1,
      "myth": "Myth: [unique weight loss myth]",
      "fact": "Fact: [scientific truth]",
      "explanation": "Detailed explanation with scientific backing"
    }
  ]
}

Be creative and avoid common myths. Return only JSON.""",
            
            """Generate 4 unique nutrition myths about SUPPLEMENTS and VITAMINS. Focus on misconceptions about specific supplements, vitamin requirements, or supplement effectiveness. Use this JSON format:

{
  "myths": [
    {
      "id": 1,
      "myth": "Myth: [unique supplement/vitamin myth]",
      "fact": "Fact: [scientific truth]",
      "explanation": "Detailed explanation with scientific backing"
    }
  ]
}

Be creative and avoid common myths. Return only JSON.""",
            
            """Generate 4 unique nutrition myths about FOOD TIMING and MEAL PATTERNS. Focus on when to eat, meal frequency, fasting myths, or eating windows. Use this JSON format:

{
  "myths": [
    {
      "id": 1,
      "myth": "Myth: [unique food timing myth]",
      "fact": "Fact: [scientific truth]",
      "explanation": "Detailed explanation with scientific backing"
    }
  ]
}

Be creative and avoid common myths. Return only JSON.""",
            
            """Generate 4 unique nutrition myths about SPECIFIC FOODS and SUPERFOODS. Focus on misconceptions about particular foods, superfood claims, or food combinations. Use this JSON format:

{
  "myths": [
    {
      "id": 1,
      "myth": "Myth: [unique food/superfood myth]",
      "fact": "Fact: [scientific truth]",
      "explanation": "Detailed explanation with scientific backing"
    }
  ]
}

Be creative and avoid common myths. Return only JSON.""",
            
            """Generate 4 unique nutrition myths about METABOLISM and BODY PROCESSES. Focus on how the body processes food, metabolic rate myths, or digestive misconceptions. Use this JSON format:

{
  "myths": [
    {
      "id": 1,
      "myth": "Myth: [unique metabolism myth]",
      "fact": "Fact: [scientific truth]",
      "explanation": "Detailed explanation with scientific backing"
    }
  ]
}

Be creative and avoid common myths. Return only JSON."""
        ]
        
        # Randomly select a prompt variation
        prompt = random.choice(prompt_variations)

        logger.info("Making Groq API call for myth generation...")
        
        # Add timestamp to ensure uniqueness
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        enhanced_prompt = f"{prompt}\n\nCurrent timestamp: {timestamp}\n\nIMPORTANT: Generate completely unique myths that are different from typical nutrition myths. Be creative and specific."
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": enhanced_prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            stream=False,
            max_tokens=4000,
            temperature=0.9
        )

        # Parse the response
        response_content = chat_completion.choices[0].message.content.strip()
        logger.info(f"Groq API response received: {len(response_content)} characters")
        logger.info(f"Response preview: {response_content[:200]}...")
        
        try:
            # Remove any potential markdown formatting
            if response_content.startswith("```json"):
                response_content = response_content.replace("```json", "").replace("```json", "").replace("```", "")
            elif response_content.startswith("```"):
                response_content = response_content.replace("```","")
            
            myths_data = json.loads(response_content)
            
            # Validate the required structure
            if "myths" not in myths_data or not isinstance(myths_data["myths"], list):
                raise ValueError("Invalid myths data structure")
            
            for myth in myths_data["myths"]:
                required_fields = ["id", "myth", "fact", "explanation"]
                if not all(field in myth for field in required_fields):
                    raise ValueError("Missing required fields in myth data")
            
            logger.info("Myth facts generated successfully")
            return myths_data
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse myths response: {str(e)}")
            # Fallback myths
            return {
                "myths": [
                    {
                        "id": 1,
                        "myth": "Myth: Carbs make you gain weight",
                        "fact": "Fact: Excess calories, not carbs themselves, lead to weight gain",
                        "explanation": "Carbohydrates are an essential macronutrient that provides energy for your body. Weight gain occurs when you consume more calories than you burn, regardless of the source."
                    },
                    {
                        "id": 2,
                        "myth": "Myth: You need to drink 8 glasses of water daily",
                        "fact": "Fact: Water needs vary based on individual factors",
                        "explanation": "Your hydration needs depend on your activity level, climate, overall health, and body size. Listen to your body and drink when thirsty."
                    },
                    {
                        "id": 3,
                        "myth": "Myth: Eating fat makes you fat",
                        "fact": "Fact: Healthy fats are essential for optimal health",
                        "explanation": "Healthy fats like those found in avocados, nuts, and olive oil are crucial for hormone production, nutrient absorption, and brain function. Weight gain comes from consuming more calories than you burn."
                    },
                    {
                        "id": 4,
                        "myth": "Myth: Skipping meals helps you lose weight faster",
                        "fact": "Fact: Regular meals support healthy metabolism",
                        "explanation": "Skipping meals can slow your metabolism and lead to overeating later. Consistent, balanced meals help maintain stable blood sugar and energy levels."
                    }
                ]
            }

    except Exception as e:
        logger.error(f"Myth generation error: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        
        # Check if it's a Groq API error
        if "groq" in str(e).lower() or "api" in str(e).lower():
            logger.error("Groq API error detected, using fallback myths")
        else:
            logger.error("Unknown error occurred during myth generation")
            
        # Return fallback myths
        return {
            "myths": [
                {
                    "id": 1,
                    "myth": "Myth: All calories are equal",
                    "fact": "Fact: The source of calories matters for health",
                    "explanation": "While calories determine weight change, the source affects metabolism, hunger, and overall health. 100 calories from vegetables impact your body differently than 100 calories from candy."
                },
                {
                    "id": 2,
                    "myth": "Myth: Detox diets cleanse your body",
                    "fact": "Fact: Your liver and kidneys naturally detoxify your body",
                    "explanation": "Your body has built-in detoxification systems that work continuously. Most detox diets are unnecessary and can be harmful, lacking scientific evidence for their claimed benefits."
                },
                {
                    "id": 3,
                    "myth": "Myth: Supplements can replace a balanced diet",
                    "fact": "Fact: Whole foods provide nutrients in optimal forms",
                    "explanation": "While supplements can help with deficiencies, whole foods provide nutrients in bioavailable forms with cofactors that enhance absorption. A varied diet is the best foundation for nutrition."
                },
                {
                    "id": 4,
                    "myth": "Myth: You must avoid all processed foods",
                    "fact": "Fact: Not all processed foods are unhealthy",
                    "explanation": "Processing ranges from minimal (like frozen vegetables) to highly processed (like chips). Focus on limiting ultra-processed foods while including minimally processed options in a balanced diet."
                }
            ]
        }

@router.get("/random-myth")
async def get_random_myth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get a single random myth for quick learning"""
    try:
        # Verify token
        email = verify_token(credentials.credentials)
        
        # Generate a single myth
        prompt = """Generate 1 nutrition myth with fact in JSON format:

{
  "myth": "Myth: [common nutrition misconception]",
  "fact": "Fact: [scientific truth]",
  "explanation": "Brief explanation with scientific backing"
}

Make it educational and surprising. Return only JSON."""

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

        response_content = chat_completion.choices.message.content.strip()
        
        try:
            if response_content.startswith("```json"):
                response_content = response_content.replace("```json", "").replace("```json", "").replace("```", "")
            elif response_content.startswith("```"):
                response_content = response_content.replace("```","")
            
            myth_data = json.loads(response_content)
            return myth_data
            
        except (json.JSONDecodeError, ValueError):
            # Fallback single myth
            return {
                "myth": "Myth: Eating late at night causes weight gain",
                "fact": "Fact: Total daily calories matter more than timing",
                "explanation": "Weight gain occurs when you consume more calories than you burn over time, regardless of when you eat. However, late-night eating may lead to poor food choices."
            }

    except Exception as e:
        logger.error(f"Random myth error: {str(e)}")
        return {
            "myth": "Myth: Brown bread is always healthier than white bread",
            "fact": "Fact: Not all brown bread is whole grain",
            "explanation": "Some brown bread is just white bread with coloring. Look for 'whole grain' or 'whole wheat' as the first ingredient to ensure you're getting the fiber and nutrients."
        }
