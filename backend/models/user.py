from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        schema = handler(core_schema)
        schema.update(type="string")
        return schema

class HealthCondition(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    condition_name: str = Field(..., min_length=1, max_length=100)
    diagnosed_date: Optional[str] = Field(None, description="Date diagnosed in YYYY-MM-DD format")
    severity: Optional[str] = Field(None, description="Mild, Moderate, Severe")
    medications: Optional[List[str]] = Field(default=[], description="List of medications")
    notes: Optional[str] = Field(None, max_length=500)
    is_chronic: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DiseaseHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    disease_name: str = Field(..., min_length=1, max_length=100)
    onset_date: Optional[str] = Field(None, description="Date of onset in YYYY-MM-DD format")
    recovery_date: Optional[str] = Field(None, description="Date of recovery in YYYY-MM-DD format")
    treatment_received: Optional[str] = Field(None, max_length=300)
    complications: Optional[List[str]] = Field(default=[])
    family_history: bool = Field(default=False)
    notes: Optional[str] = Field(None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class HealthProfile(BaseModel):
    blood_type: Optional[str] = Field(None, description="A+, A-, B+, B-, AB+, AB-, O+, O-")
    height: Optional[float] = Field(None, ge=50, le=300, description="Height in cm")
    weight: Optional[float] = Field(None, ge=20, le=500, description="Weight in kg")
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s\-\(\)]{10,}$')
    emergency_contact_relationship: Optional[str] = Field(None, max_length=50)
    allergies: Optional[List[str]] = Field(default=[])
    current_medications: Optional[List[str]] = Field(default=[])
    dietary_restrictions: Optional[List[str]] = Field(default=[])
    exercise_frequency: Optional[str] = Field(None, description="Daily, Weekly, Monthly, Rarely, Never")
    smoking_status: Optional[str] = Field(None, description="Never, Former, Current")
    alcohol_consumption: Optional[str] = Field(None, description="Never, Rarely, Moderate, Heavy")
    health_conditions: Optional[List[HealthCondition]] = Field(default=[])
    disease_history: Optional[List[DiseaseHistory]] = Field(default=[])
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^\+?[\d\s\-\(\)]{10,}$')
    date_of_birth: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    city: str = Field(..., min_length=2, max_length=50)
    state: str = Field(..., min_length=2, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    @validator('password')
    def validate_password(cls, v):
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: int = Field(..., description="Auto-incrementing user ID")
    hashed_password: str
    is_active: bool = True
    role: str = "patient"
    health_profile: Optional[HealthProfile] = Field(default_factory=HealthProfile)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserResponse(UserBase):
    id: str  # MongoDB ObjectId as string
    user_id: int  # Auto-incrementing user ID
    role: str
    is_active: bool
    health_profile: Optional[HealthProfile] = None  # Make this optional to prevent errors
    created_at: datetime


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s\-\(\)]{10,}$')
    city: Optional[str] = Field(None, min_length=2, max_length=50)
    state: Optional[str] = Field(None, min_length=2, max_length=50)
    health_profile: Optional[HealthProfile] = None

class HealthConditionRequest(BaseModel):
    condition_name: str = Field(..., min_length=1, max_length=100)
    diagnosed_date: Optional[str] = None
    severity: Optional[str] = None
    medications: Optional[List[str]] = Field(default=[])
    notes: Optional[str] = Field(None, max_length=500)
    is_chronic: bool = Field(default=False)

class DiseaseHistoryRequest(BaseModel):
    disease_name: str = Field(..., min_length=1, max_length=100)
    onset_date: Optional[str] = None
    recovery_date: Optional[str] = None
    treatment_received: Optional[str] = Field(None, max_length=300)
    complications: Optional[List[str]] = Field(default=[])
    family_history: bool = Field(default=False)
    notes: Optional[str] = Field(None, max_length=500)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
