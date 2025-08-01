from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

class ContactResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str
    created_at: datetime
    status: str = "pending" 