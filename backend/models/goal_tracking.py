from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict
from datetime import datetime, date
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

# Separate Weight Log Model for continuous tracking
class WeightLog(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    user_id: int = Field(..., description="User's auto-incrementing ID")
    weight: float = Field(..., ge=20, le=500, description="Weight in kg")
    bmi: Optional[float] = Field(default=None)
    body_fat_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    muscle_mass: Optional[float] = Field(default=None, ge=0, le=200)
    notes: Optional[str] = Field(default=None, max_length=500)
    measurement_time: str = Field(default="morning", description="morning, afternoon, evening, night")
    logged_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True, "arbitrary_types_allowed": True}

class MealEntry(BaseModel):
    meal_type: str = Field(..., description="breakfast, lunch, dinner, snacks")
    completed: bool = Field(default=False)
    completed_at: Optional[datetime] = Field(default=None)
    calories: Optional[int] = Field(default=0)
    notes: Optional[str] = Field(default=None)

class WaterIntakeEntry(BaseModel):
    glasses: int = Field(..., ge=0, le=20)
    goal: int = Field(default=8)
    logged_at: datetime = Field(default_factory=datetime.utcnow)

class WeightEntry(BaseModel):
    weight: float = Field(..., ge=20, le=500, description="Weight in kg")
    bmi: Optional[float] = Field(default=None)
    notes: Optional[str] = Field(default=None)
    logged_at: datetime = Field(default_factory=datetime.utcnow)

class ExerciseEntry(BaseModel):
    exercise_name: str = Field(..., min_length=1, max_length=100)
    duration_minutes: int = Field(..., ge=1, le=600)
    calories_burned: int = Field(..., ge=0, le=2000)
    exercise_type: Optional[str] = Field(default=None, description="cardio, strength, flexibility, sports")
    intensity: Optional[str] = Field(default=None, description="low, moderate, high")
    notes: Optional[str] = Field(default=None)
    logged_at: datetime = Field(default_factory=datetime.utcnow)

class DailyGoalTracking(BaseModel):
    model_config = {"populate_by_name": True, "arbitrary_types_allowed": True}
    
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: int = Field(..., description="User's auto-incrementing ID")
    tracking_date: date = Field(..., description="Date for this tracking entry")
    meals: List[MealEntry] = Field(default_factory=list)
    water_intake: Optional[WaterIntakeEntry] = Field(default=None)
    weight_entry: Optional[WeightEntry] = Field(default=None)  # Keep for daily summary
    exercises: List[ExerciseEntry] = Field(default_factory=list)
    mood: Optional[str] = Field(default=None, description="good, okay, bad")
    sleep_hours: Optional[float] = Field(default=None, ge=0, le=24)
    daily_notes: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        schema = handler(core_schema)
        schema.update(json_encoders={ObjectId: str, date: lambda v: v.isoformat()})
        return schema

# Request models
class MealUpdateRequest(BaseModel):
    meal_type: str
    completed: bool
    calories: Optional[int] = 0
    notes: Optional[str] = None

class WaterIntakeRequest(BaseModel):
    glasses: int = Field(..., ge=0, le=20)
    goal: int = Field(default=8)

class WeightEntryRequest(BaseModel):
    weight: float = Field(..., ge=20, le=500)
    height: Optional[float] = Field(default=None, ge=100, le=250, description="Height in cm for BMI calculation")
    notes: Optional[str] = Field(default=None)

class WeightLogRequest(BaseModel):
    weight: float = Field(..., ge=20, le=500)
    height: Optional[float] = Field(default=None, ge=100, le=250, description="Height in cm for BMI calculation")
    body_fat_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    muscle_mass: Optional[float] = Field(default=None, ge=0, le=200)
    notes: Optional[str] = Field(default=None, max_length=500)
    measurement_time: str = Field(default="morning", description="morning, afternoon, evening, night")

class ExerciseEntryRequest(BaseModel):
    exercise_name: str = Field(..., min_length=1, max_length=100)
    duration_minutes: int = Field(..., ge=1, le=600)
    calories_burned: int = Field(..., ge=0, le=2000)
    exercise_type: Optional[str] = Field(default=None)
    intensity: Optional[str] = Field(default=None)
    notes: Optional[str] = Field(default=None)

# Response models
class WeightLogResponse(BaseModel):
    id: str
    user_id: int
    weight: float
    bmi: Optional[float]
    body_fat_percentage: Optional[float]
    muscle_mass: Optional[float]
    notes: Optional[str]
    measurement_time: str
    logged_at: datetime
    created_at: datetime

class DailyGoalResponse(BaseModel):
    date: str
    meals: List[MealEntry]
    water_intake: Optional[WaterIntakeEntry]
    weight_entry: Optional[WeightEntry]
    latest_weight_log: Optional[WeightLogResponse]  # Add latest weight log
    exercises: List[ExerciseEntry]
    mood: Optional[str]
    sleep_hours: Optional[float]
    daily_notes: Optional[str]
    total_calories_burned: int
    total_exercise_minutes: int

class WeightTrendResponse(BaseModel):
    entries: List[Dict]
    trend: str  # "increasing", "decreasing", "stable"
    total_change: float
    average_weekly_change: float

# Enhanced Analytics Response
class WeightTrendAnalytics(BaseModel):
    entries: List[Dict]
    trend: str  # "increasing", "decreasing", "stable"
    total_change: float
    average_weekly_change: float
    highest_weight: Dict
    lowest_weight: Dict
    weight_loss_periods: List[Dict]
    weight_gain_periods: List[Dict]
    bmi_trend: Optional[List[Dict]]

class AnalyticsResponse(BaseModel):
    weight_trend: WeightTrendAnalytics
    exercise_summary: Dict
    water_intake_average: float
    meal_completion_rate: float
    total_calories_burned: int
    active_days: int

# Additional request models for mood and sleep tracking
class MoodUpdateRequest(BaseModel):
    mood: str = Field(..., description="good, okay, bad")

class SleepUpdateRequest(BaseModel):
    sleep_hours: float = Field(..., ge=0, le=24)

# Weekly summary response
class WeeklySummaryResponse(BaseModel):
    week_start: str
    week_end: str
    summary: Dict
    daily_summaries: List[Dict]
