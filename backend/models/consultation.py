from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from models.user import PyObjectId

class ConsultationSlot(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    time: str = Field(..., description="Time in HH:MM format")
    is_available: bool = True

class Dietitian(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(..., min_length=2, max_length=100)
    specialization: str = Field(..., min_length=2, max_length=100)
    experience: int = Field(..., ge=0, description="Years of experience")
    rating: float = Field(default=0.0, ge=0, le=5)
    bio: str = Field(default="", description="Brief biography")
    profile_image: Optional[str] = Field(default=None, description="Profile image URL")
    available_slots: List[ConsultationSlot] = Field(default=[])
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ConsultationBooking(BaseModel):
    patient_id: PyObjectId = Field(..., description="Patient's ObjectId")
    patient_user_id: int = Field(..., description="Patient's auto-incrementing user ID")
    dietitian_id: PyObjectId = Field(..., description="Dietitian's ObjectId")
    consultation_type: str = Field(..., description="video_call, phone_call, or in_person")
    appointment_date: str = Field(..., description="Date in YYYY-MM-DD format")
    appointment_time: str = Field(..., description="Time in HH:MM format")
    duration: int = Field(default=60, description="Duration in minutes")
    notes: Optional[str] = Field(default="", description="Additional notes from patient")
    status: str = Field(default="scheduled", description="scheduled, completed, cancelled, rescheduled")
    meeting_link: Optional[str] = Field(default=None, description="Video call link if applicable")
    
    @validator('consultation_type')
    def validate_consultation_type(cls, v):
        allowed_types = ['video_call', 'phone_call', 'in_person']
        if v not in allowed_types:
            raise ValueError(f'Consultation type must be one of {allowed_types}')
        return v
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['scheduled', 'completed', 'cancelled', 'rescheduled']
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of {allowed_statuses}')
        return v

class ConsultationBookingInDB(ConsultationBooking):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    booking_id: int = Field(..., description="Auto-incrementing booking ID")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ConsultationBookingResponse(BaseModel):
    id: str
    booking_id: int
    patient_user_id: int
    dietitian: dict  # Will include dietitian details
    consultation_type: str
    appointment_date: str
    appointment_time: str
    duration: int
    notes: str
    status: str
    meeting_link: Optional[str]
    created_at: datetime

class BookingCreate(BaseModel):
    dietitian_id: str = Field(..., description="Dietitian's ObjectId as string")
    consultation_type: str
    appointment_date: str
    appointment_time: str
    duration: int = Field(default=60)
    notes: Optional[str] = Field(default="")
