from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatbotRequest(BaseModel):
    message: str
    context: Optional[str] = "nutrition_diet_health"

class ChatbotResponse(BaseModel):
    response: str
    timestamp: datetime
    context: str 