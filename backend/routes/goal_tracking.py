from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
import logging
from statistics import mean
from bson import ObjectId

from models.goal_tracking import (
    DailyGoalTracking, DailyGoalResponse, MealUpdateRequest,
    WaterIntakeRequest, WeightEntryRequest, ExerciseEntryRequest,
    MealEntry, WaterIntakeEntry, WeightEntry, ExerciseEntry,
    WeightTrendResponse, AnalyticsResponse, WeightLog, WeightLogRequest,
    WeightLogResponse, WeightTrendAnalytics, MoodUpdateRequest, SleepUpdateRequest,
    WeeklySummaryResponse
)
from utils.security import verify_token
from database.config import get_database

router = APIRouter(prefix="/goal-tracking", tags=["Goal Tracking"])
security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_user_by_email(email: str, db):
    """Helper function to get user by email"""
    users_collection = db.users
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

# Enhanced weight logging endpoints
@router.post("/weight-log", response_model=WeightLogResponse)
async def add_weight_log(
    weight_data: WeightLogRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Add a new weight log entry - supports multiple entries per day"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        # Calculate BMI if height is provided
        bmi = None
        if weight_data.height:
            bmi = weight_data.weight / ((weight_data.height / 100) ** 2)
        
        # Create weight log entry
        weight_log_dict = {
            "_id": ObjectId(),
            "user_id": user["user_id"],
            "weight": weight_data.weight,
            "bmi": round(bmi, 1) if bmi else None,
            "body_fat_percentage": weight_data.body_fat_percentage,
            "muscle_mass": weight_data.muscle_mass,
            "notes": weight_data.notes,
            "measurement_time": weight_data.measurement_time,
            "logged_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        
        # Insert into weight_logs collection
        weight_logs_collection = db.weight_logs
        result = await weight_logs_collection.insert_one(weight_log_dict)
        
        # Also update today's daily tracking with latest weight
        goal_tracking_collection = db.goal_tracking
        today = date.today()
        
        weight_summary = WeightEntry(
            weight=weight_data.weight,
            bmi=round(bmi, 1) if bmi else None,
            notes=weight_data.notes,
            logged_at=datetime.utcnow()
        )
        
        await goal_tracking_collection.update_one(
            {"user_id": user["user_id"], "tracking_date": today.isoformat()},
            {
                "$set": {
                    "weight_entry": weight_summary.model_dump(),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        # Get the created weight log
        created_log = await weight_logs_collection.find_one({"_id": result.inserted_id})
        
        return WeightLogResponse(
            id=str(created_log["_id"]),
            user_id=created_log["user_id"],
            weight=created_log["weight"],
            bmi=created_log.get("bmi"),
            body_fat_percentage=created_log.get("body_fat_percentage"),
            muscle_mass=created_log.get("muscle_mass"),
            notes=created_log.get("notes"),
            measurement_time=created_log["measurement_time"],
            logged_at=created_log["logged_at"],
            created_at=created_log["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding weight log: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding weight log"
        )

@router.get("/weight-logs", response_model=List[WeightLogResponse])
async def get_weight_logs(
    days: int = 30,
    limit: int = 100,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user's weight logs with pagination"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        weight_logs_collection = db.weight_logs
        
        # Get weight logs from the last N days
        start_date = datetime.utcnow() - timedelta(days=days)
        
        cursor = weight_logs_collection.find({
            "user_id": user["user_id"],
            "logged_at": {"$gte": start_date}
        }).sort("logged_at", -1).limit(limit)
        
        weight_logs = await cursor.to_list(length=None)
        
        return [
            WeightLogResponse(
                id=str(log["_id"]),
                user_id=log["user_id"],
                weight=log["weight"],
                bmi=log.get("bmi"),
                body_fat_percentage=log.get("body_fat_percentage"),
                muscle_mass=log.get("muscle_mass"),
                notes=log.get("notes"),
                measurement_time=log["measurement_time"],
                logged_at=log["logged_at"],
                created_at=log["created_at"]
            )
            for log in weight_logs
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting weight logs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching weight logs"
        )

@router.delete("/weight-log/{log_id}")
async def delete_weight_log(
    log_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete a weight log entry"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        weight_logs_collection = db.weight_logs
        
        # Delete the weight log
        result = await weight_logs_collection.delete_one({
            "_id": ObjectId(log_id),
            "user_id": user["user_id"]
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Weight log not found"
            )
        
        return {"message": "Weight log deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting weight log: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting weight log"
        )

@router.get("/today", response_model=DailyGoalResponse)
async def get_today_tracking(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get today's goal tracking data for the current user"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        goal_tracking_collection = db.goal_tracking
        weight_logs_collection = db.weight_logs
        today = date.today()
        
        # Get today's tracking data
        tracking_data = await goal_tracking_collection.find_one({
            "user_id": user["user_id"],
            "tracking_date": today.isoformat()
        })
        
        if not tracking_data:
            # Create default tracking entry for today
            default_meals = [
                MealEntry(meal_type="breakfast"),
                MealEntry(meal_type="lunch"),
                MealEntry(meal_type="dinner"),
                MealEntry(meal_type="snacks")
            ]
            
            new_tracking = DailyGoalTracking(
                user_id=user["user_id"],
                tracking_date=today,
                meals=default_meals
            )
            
            tracking_dict = new_tracking.model_dump(by_alias=True)
            tracking_dict["tracking_date"] = today.isoformat()
            
            await goal_tracking_collection.insert_one(tracking_dict)
            tracking_data = tracking_dict
        
        # Get latest weight log for today
        latest_weight_log = await weight_logs_collection.find_one(
            {
                "user_id": user["user_id"],
                "logged_at": {
                    "$gte": datetime.combine(today, datetime.min.time()),
                    "$lt": datetime.combine(today + timedelta(days=1), datetime.min.time())
                }
            },
            sort=[("logged_at", -1)]
        )
        
        latest_weight_response = None
        if latest_weight_log:
            latest_weight_response = WeightLogResponse(
                id=str(latest_weight_log["_id"]),
                user_id=latest_weight_log["user_id"],
                weight=latest_weight_log["weight"],
                bmi=latest_weight_log.get("bmi"),
                body_fat_percentage=latest_weight_log.get("body_fat_percentage"),
                muscle_mass=latest_weight_log.get("muscle_mass"),
                notes=latest_weight_log.get("notes"),
                measurement_time=latest_weight_log["measurement_time"],
                logged_at=latest_weight_log["logged_at"],
                created_at=latest_weight_log["created_at"]
            )
        
        # Calculate totals
        total_calories_burned = sum(ex.get("calories_burned", 0) for ex in tracking_data.get("exercises", []))
        total_exercise_minutes = sum(ex.get("duration_minutes", 0) for ex in tracking_data.get("exercises", []))
        
        return DailyGoalResponse(
            date=tracking_data["tracking_date"],
            meals=tracking_data.get("meals", []),
            water_intake=tracking_data.get("water_intake"),
            weight_entry=tracking_data.get("weight_entry"),
            latest_weight_log=latest_weight_response,
            exercises=tracking_data.get("exercises", []),
            mood=tracking_data.get("mood"),
            sleep_hours=tracking_data.get("sleep_hours"),
            daily_notes=tracking_data.get("daily_notes"),
            total_calories_burned=total_calories_burned,
            total_exercise_minutes=total_exercise_minutes
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting today's tracking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching tracking data"
        )

@router.put("/meal")
async def update_meal_status(
    meal_data: MealUpdateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update meal completion status"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        goal_tracking_collection = db.goal_tracking
        today = date.today()
        
        # Update meal status
        completed_at = datetime.utcnow() if meal_data.completed else None
        
        result = await goal_tracking_collection.update_one(
            {
                "user_id": user["user_id"],
                "tracking_date": today.isoformat(),
                "meals.meal_type": meal_data.meal_type
            },
            {
                "$set": {
                    "meals.$.completed": meal_data.completed,
                    "meals.$.completed_at": completed_at,
                    "meals.$.calories": meal_data.calories,
                    "meals.$.notes": meal_data.notes,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meal entry not found"
            )
        
        return {"message": "Meal status updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating meal: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating meal status"
        )

@router.put("/water-intake")
async def update_water_intake(
    water_data: WaterIntakeRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update water intake for today"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        goal_tracking_collection = db.goal_tracking
        today = date.today()
        
        water_entry = WaterIntakeEntry(
            glasses=water_data.glasses,
            goal=water_data.goal,
            logged_at=datetime.utcnow()
        )
        
        result = await goal_tracking_collection.update_one(
            {"user_id": user["user_id"], "tracking_date": today.isoformat()},
            {
                "$set": {
                    "water_intake": water_entry.model_dump(),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {"message": "Water intake updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating water intake: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating water intake"
        )

@router.post("/weight")
async def add_weight_entry(
    weight_data: WeightEntryRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Add a new weight entry (backward compatibility)"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        # Calculate BMI if height is provided
        bmi = None
        if weight_data.height:
            bmi = weight_data.weight / ((weight_data.height / 100) ** 2)
        
        weight_entry = WeightEntry(
            weight=weight_data.weight,
            bmi=round(bmi, 1) if bmi else None,
            notes=weight_data.notes,
            logged_at=datetime.utcnow()
        )
        
        goal_tracking_collection = db.goal_tracking
        today = date.today()
        
        result = await goal_tracking_collection.update_one(
            {"user_id": user["user_id"], "tracking_date": today.isoformat()},
            {
                "$set": {
                    "weight_entry": weight_entry.model_dump(),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {"message": "Weight entry added successfully", "bmi": bmi}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding weight entry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding weight entry"
        )

@router.post("/exercise")
async def add_exercise_entry(
    exercise_data: ExerciseEntryRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Add a new exercise entry"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        exercise_entry = ExerciseEntry(
            exercise_name=exercise_data.exercise_name,
            duration_minutes=exercise_data.duration_minutes,
            calories_burned=exercise_data.calories_burned,
            exercise_type=exercise_data.exercise_type,
            intensity=exercise_data.intensity,
            notes=exercise_data.notes,
            logged_at=datetime.utcnow()
        )
        
        goal_tracking_collection = db.goal_tracking
        today = date.today()
        
        result = await goal_tracking_collection.update_one(
            {"user_id": user["user_id"], "tracking_date": today.isoformat()},
            {
                "$push": {"exercises": exercise_entry.model_dump()},
                "$set": {"updated_at": datetime.utcnow()}
            },
            upsert=True
        )
        
        return {"message": "Exercise entry added successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding exercise entry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding exercise entry"
        )

@router.get("/weight-history")
async def get_weight_history(
    days: int = 30,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get weight history for analytics"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        goal_tracking_collection = db.goal_tracking
        
        # Get data from the last N days
        start_date = date.today() - timedelta(days=days)
        
        cursor = goal_tracking_collection.find({
            "user_id": user["user_id"],
            "tracking_date": {"$gte": start_date.isoformat()},
            "weight_entry": {"$exists": True}
        }).sort("tracking_date", 1)
        
        tracking_data = await cursor.to_list(length=None)
        
        weight_entries = []
        for entry in tracking_data:
            if entry.get("weight_entry"):
                weight_entries.append({
                    "date": entry["tracking_date"],
                    "weight": entry["weight_entry"]["weight"],
                    "bmi": entry["weight_entry"].get("bmi"),
                    "notes": entry["weight_entry"].get("notes")
                })
        
        # Calculate trend
        trend = "stable"
        total_change = 0
        average_weekly_change = 0
        
        if len(weight_entries) >= 2:
            total_change = weight_entries[-1]["weight"] - weight_entries[0]["weight"]
            if total_change > 0.5:
                trend = "increasing"
            elif total_change < -0.5:
                trend = "decreasing"
            
            # Calculate average weekly change
            weeks = days / 7
            average_weekly_change = total_change / weeks if weeks > 0 else 0
        
        return {
            "entries": weight_entries,
            "trend": trend,
            "total_change": round(total_change, 1),
            "average_weekly_change": round(average_weekly_change, 2)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting weight history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching weight history"
        )

@router.get("/weight-analytics")
async def get_weight_analytics(
    days: int = 90,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get comprehensive weight analytics with trends"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        weight_logs_collection = db.weight_logs
        
        # Get weight logs from the last N days
        start_date = datetime.utcnow() - timedelta(days=days)
        
        cursor = weight_logs_collection.find({
            "user_id": user["user_id"],
            "logged_at": {"$gte": start_date}
        }).sort("logged_at", 1)
        
        weight_logs = await cursor.to_list(length=None)
        
        if not weight_logs:
            return WeightTrendAnalytics(
                entries=[],
                trend="stable",
                total_change=0,
                average_weekly_change=0,
                highest_weight={},
                lowest_weight={},
                weight_loss_periods=[],
                weight_gain_periods=[],
                bmi_trend=[]
            )
        
        # Process weight entries for analytics
        entries = []
        bmi_trend = []
        weights = []
        
        for log in weight_logs:
            entry = {
                "date": log["logged_at"].isoformat(),
                "weight": log["weight"],
                "bmi": log.get("bmi"),
                "notes": log.get("notes"),
                "measurement_time": log["measurement_time"]
            }
            entries.append(entry)
            weights.append(log["weight"])
            
            if log.get("bmi"):
                bmi_trend.append({
                    "date": log["logged_at"].isoformat(),
                    "bmi": log["bmi"]
                })
        
        # Calculate trends
        trend = "stable"
        total_change = 0
        average_weekly_change = 0
        
        if len(weights) >= 2:
            total_change = weights[-1] - weights[0]
            if total_change > 0.5:
                trend = "increasing"
            elif total_change < -0.5:
                trend = "decreasing"
            
            # Calculate average weekly change
            weeks = days / 7
            average_weekly_change = total_change / weeks if weeks > 0 else 0
        
        # Find highest and lowest weights
        highest_weight = {}
        lowest_weight = {}
        
        if weights:
            max_weight = max(weights)
            min_weight = min(weights)
            
            for log in weight_logs:
                if log["weight"] == max_weight and not highest_weight:
                    highest_weight = {
                        "weight": log["weight"],
                        "date": log["logged_at"].isoformat(),
                        "bmi": log.get("bmi")
                    }
                
                if log["weight"] == min_weight and not lowest_weight:
                    lowest_weight = {
                        "weight": log["weight"],
                        "date": log["logged_at"].isoformat(),
                        "bmi": log.get("bmi")
                    }
        
        # Identify weight loss and gain periods
        weight_loss_periods = []
        weight_gain_periods = []
        
        if len(weight_logs) >= 2:
            current_trend = None
            trend_start = weight_logs[0]
            
            for i in range(1, len(weight_logs)):
                current_log = weight_logs[i]
                prev_log = weight_logs[i-1]
                
                if current_log["weight"] < prev_log["weight"]:
                    if current_trend != "loss":
                        if current_trend == "gain" and trend_start:
                            weight_gain_periods.append({
                                "start_date": trend_start["logged_at"].isoformat(),
                                "end_date": prev_log["logged_at"].isoformat(),
                                "start_weight": trend_start["weight"],
                                "end_weight": prev_log["weight"],
                                "change": prev_log["weight"] - trend_start["weight"]
                            })
                        current_trend = "loss"
                        trend_start = prev_log
                
                elif current_log["weight"] > prev_log["weight"]:
                    if current_trend != "gain":
                        if current_trend == "loss" and trend_start:
                            weight_loss_periods.append({
                                "start_date": trend_start["logged_at"].isoformat(),
                                "end_date": prev_log["logged_at"].isoformat(),
                                "start_weight": trend_start["weight"],
                                "end_weight": prev_log["weight"],
                                "change": prev_log["weight"] - trend_start["weight"]
                            })
                        current_trend = "gain"
                        trend_start = prev_log
        
        return WeightTrendAnalytics(
            entries=entries,
            trend=trend,
            total_change=round(total_change, 1),
            average_weekly_change=round(average_weekly_change, 2),
            highest_weight=highest_weight,
            lowest_weight=lowest_weight,
            weight_loss_periods=weight_loss_periods,
            weight_gain_periods=weight_gain_periods,
            bmi_trend=bmi_trend if bmi_trend else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting weight analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching weight analytics"
        )

@router.get("/analytics")
async def get_analytics(
    days: int = 30,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get comprehensive analytics for the user including enhanced weight trends"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        goal_tracking_collection = db.goal_tracking
        start_date = date.today() - timedelta(days=days)
        
        # Get all tracking data for the period
        cursor = goal_tracking_collection.find({
            "user_id": user["user_id"],
            "tracking_date": {"$gte": start_date.isoformat()}
        }).sort("tracking_date", 1)
        
        tracking_data = await cursor.to_list(length=None)
        
        # Process analytics
        total_calories_burned = 0
        total_exercise_minutes = 0
        water_intake_days = []
        meal_completion_data = []
        exercise_types = {}
        active_days = 0
        
        for entry in tracking_data:
            exercises = entry.get("exercises", [])
            if exercises:
                active_days += 1
                for exercise in exercises:
                    total_calories_burned += exercise.get("calories_burned", 0)
                    total_exercise_minutes += exercise.get("duration_minutes", 0)
                    ex_type = exercise.get("exercise_type", "other")
                    exercise_types[ex_type] = exercise_types.get(ex_type, 0) + exercise.get("duration_minutes", 0)
            
            water_intake = entry.get("water_intake")
            if water_intake:
                water_intake_days.append(water_intake.get("glasses", 0))
            
            meals = entry.get("meals", [])
            if meals:
                completed_meals = sum(1 for meal in meals if meal.get("completed", False))
                meal_completion_data.append(completed_meals / len(meals) * 100)
        
        # Calculate averages
        water_intake_average = mean(water_intake_days) if water_intake_days else 0
        meal_completion_rate = mean(meal_completion_data) if meal_completion_data else 0
        
        # Get enhanced weight analytics
        weight_analytics = await get_weight_analytics(days * 3, credentials)  # Get more data for trends
        
        return {
            "weight_trend": weight_analytics,
            "exercise_summary": {
                "total_calories_burned": total_calories_burned,
                "total_minutes": total_exercise_minutes,
                "by_type": exercise_types,
                "active_days": active_days
            },
            "water_intake_average": round(water_intake_average, 1),
            "meal_completion_rate": round(meal_completion_rate, 1),
            "total_calories_burned": total_calories_burned,
            "active_days": active_days
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching analytics"
        )

@router.get("/daily-summary/{tracking_date}")
async def get_daily_summary(
    tracking_date: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get daily summary for a specific date"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        goal_tracking_collection = db.goal_tracking
        
        tracking_data = await goal_tracking_collection.find_one({
            "user_id": user["user_id"],
            "tracking_date": tracking_date
        })
        
        if not tracking_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tracking data found for this date"
            )
        
        # Calculate totals
        total_calories_burned = sum(ex.get("calories_burned", 0) for ex in tracking_data.get("exercises", []))
        total_exercise_minutes = sum(ex.get("duration_minutes", 0) for ex in tracking_data.get("exercises", []))
        completed_meals = sum(1 for meal in tracking_data.get("meals", []) if meal.get("completed", False))
        
        return {
            "date": tracking_data["tracking_date"],
            "summary": {
                "total_calories_burned": total_calories_burned,
                "total_exercise_minutes": total_exercise_minutes,
                "completed_meals": completed_meals,
                "total_meals": len(tracking_data.get("meals", [])),
                "water_glasses": tracking_data.get("water_intake", {}).get("glasses", 0),
                "weight": tracking_data.get("weight_entry", {}).get("weight"),
                "mood": tracking_data.get("mood"),
                "sleep_hours": tracking_data.get("sleep_hours")
            },
            "details": tracking_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting daily summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching daily summary"
        )

@router.get("/weekly-summary", response_model=WeeklySummaryResponse)
async def get_weekly_summary(
    start_date: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get weekly summary starting from a specific date or current week"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        # Calculate week start date
        if start_date:
            week_start = datetime.strptime(start_date, "%Y-%m-%d").date()
        else:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        week_end = week_start + timedelta(days=6)
        
        goal_tracking_collection = db.goal_tracking
        
        cursor = goal_tracking_collection.find({
            "user_id": user["user_id"],
            "tracking_date": {
                "$gte": week_start.isoformat(),
                "$lte": week_end.isoformat()
            }
        }).sort("tracking_date", 1)
        
        tracking_data = await cursor.to_list(length=None)
        
        # Calculate weekly totals
        total_calories_burned = 0
        total_exercise_minutes = 0
        total_completed_meals = 0
        total_meals = 0
        total_water_glasses = 0
        active_days = 0
        daily_summaries = []
        
        for entry in tracking_data:
            exercises = entry.get("exercises", [])
            meals = entry.get("meals", [])
            
            day_calories = sum(ex.get("calories_burned", 0) for ex in exercises)
            day_minutes = sum(ex.get("duration_minutes", 0) for ex in exercises)
            day_completed_meals = sum(1 for meal in meals if meal.get("completed", False))
            day_water = entry.get("water_intake", {}).get("glasses", 0)
            
            total_calories_burned += day_calories
            total_exercise_minutes += day_minutes
            total_completed_meals += day_completed_meals
            total_meals += len(meals)
            total_water_glasses += day_water
            
            if exercises:
                active_days += 1
            
            daily_summaries.append({
                "date": entry["tracking_date"],
                "calories_burned": day_calories,
                "exercise_minutes": day_minutes,
                "completed_meals": day_completed_meals,
                "total_meals": len(meals),
                "water_glasses": day_water,
                "weight": entry.get("weight_entry", {}).get("weight"),
                "mood": entry.get("mood")
            })
        
        meal_completion_rate = (total_completed_meals / total_meals * 100) if total_meals > 0 else 0
        avg_daily_water = total_water_glasses / 7 if len(tracking_data) > 0 else 0
        
        return WeeklySummaryResponse(
            week_start=week_start.isoformat(),
            week_end=week_end.isoformat(),
            summary={
                "total_calories_burned": total_calories_burned,
                "total_exercise_minutes": total_exercise_minutes,
                "active_days": active_days,
                "meal_completion_rate": round(meal_completion_rate, 1),
                "average_daily_water": round(avg_daily_water, 1),
                "days_tracked": len(tracking_data)
            },
            daily_summaries=daily_summaries
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting weekly summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching weekly summary"
        )

@router.put("/mood/{tracking_date}")
async def update_mood(
    tracking_date: str,
    mood_data: Dict[str, str],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update mood for a specific date"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        mood = mood_data.get("mood")
        if mood not in ["good", "okay", "bad"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mood must be 'good', 'okay', or 'bad'"
            )
        
        goal_tracking_collection = db.goal_tracking
        
        result = await goal_tracking_collection.update_one(
            {"user_id": user["user_id"], "tracking_date": tracking_date},
            {
                "$set": {
                    "mood": mood,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {"message": "Mood updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating mood: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating mood"
        )

@router.put("/sleep/{tracking_date}")
async def update_sleep_hours(
    tracking_date: str,
    sleep_data: Dict[str, float],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update sleep hours for a specific date"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        user = await get_user_by_email(email, db)
        
        sleep_hours = sleep_data.get("sleep_hours")
        if sleep_hours is None or sleep_hours < 0 or sleep_hours > 24:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sleep hours must be between 0 and 24"
            )
        
        goal_tracking_collection = db.goal_tracking
        
        result = await goal_tracking_collection.update_one(
            {"user_id": user["user_id"], "tracking_date": tracking_date},
            {
                "$set": {
                    "sleep_hours": sleep_hours,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {"message": "Sleep hours updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating sleep hours: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating sleep hours"
        )
