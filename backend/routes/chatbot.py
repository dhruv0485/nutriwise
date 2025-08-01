from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import logging
import json

from models.chatbot import ChatbotRequest, ChatbotResponse
from utils.groq_client import get_groq_client

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])
logger = logging.getLogger(__name__)

# Get shared Groq client
client = get_groq_client()

@router.post("/nutrition-advice", response_model=ChatbotResponse)
async def get_nutrition_advice(request: ChatbotRequest):
    """Get AI-powered nutrition advice using Groq"""
    try:
        # Create a comprehensive nutrition-focused prompt
        nutrition_prompt = f"""You are NutriBot, an expert AI nutritionist and dietitian assistant. You specialize in providing evidence-based nutrition advice, diet planning, and healthy eating guidance.

Your expertise includes:
- Weight management and healthy weight loss
- Meal planning and nutrition
- Dietary requirements and restrictions
- Vitamins, minerals, and supplements
- Sports nutrition and fitness
- Medical nutrition therapy
- Food safety and preparation
- Reading nutrition labels
- Healthy cooking and recipes

IMPORTANT GUIDELINES:
1. Always provide evidence-based, scientific nutrition advice
2. Be encouraging and supportive, never judgmental
3. Recommend consulting healthcare professionals for medical conditions
4. Focus on whole foods and balanced nutrition
5. Consider individual needs and preferences
6. Provide practical, actionable advice
7. Use clear, easy-to-understand language
8. Include specific food recommendations when relevant
9. Mention portion sizes and moderation
10. Emphasize the importance of hydration

User Question: {request.message}

Please provide a helpful, informative, and encouraging response that addresses their nutrition question. Keep your response conversational but professional, and aim for 2-4 paragraphs of helpful information."""

        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": nutrition_prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            stream=False,
            max_tokens=800,
            temperature=0.7,
        )

        # Extract response
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Clean up response if needed
        if response_text.startswith("NutriBot:"):
            response_text = response_text[9:].strip()
        
        logger.info(f"Chatbot response generated successfully for: {request.message[:50]}...")
        
        return ChatbotResponse(
            response=response_text,
            timestamp=datetime.utcnow(),
            context=request.context
        )
        
    except Exception as e:
        logger.error(f"Error generating nutrition advice: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate nutrition advice. Please try again."
        )

@router.get("/health")
async def chatbot_health():
    """Check if chatbot service is healthy"""
    return {"status": "healthy", "service": "nutrition_chatbot"} 