from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import logging
from bson import ObjectId
from typing import List

from models.user import (
    UserResponse, UserUpdateRequest, HealthConditionRequest, 
    DiseaseHistoryRequest, HealthCondition, DiseaseHistory
)
from utils.security import verify_token
from database.config import get_database

router = APIRouter(prefix="/profile", tags=["User Profile"])
security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/me", response_model=UserResponse)
async def get_user_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user's complete profile including health information"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        users_collection = db.users

        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Convert to response model with health profile
        user_response = UserResponse(
            id=str(user["_id"]),
            user_id=user.get("user_id", 0),
            full_name=user["full_name"],
            email=user["email"],
            phone=user["phone"],
            date_of_birth=user["date_of_birth"],
            city=user["city"],
            state=user["state"],
            role=user["role"],
            is_active=user["is_active"],
            health_profile=user.get("health_profile", {}),
            created_at=user.get("created_at", datetime.utcnow())
        )

        return user_response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user profile error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/user/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user profile by user_id"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        users_collection = db.users

        user = await users_collection.find_one({"user_id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        user_response = UserResponse(
            id=str(user["_id"]),
            user_id=user["user_id"],
            full_name=user["full_name"],
            email=user["email"],
            phone=user["phone"],
            date_of_birth=user["date_of_birth"],
            city=user["city"],
            state=user["state"],
            role=user["role"],
            is_active=user["is_active"],
            health_profile=user.get("health_profile", {}),
            created_at=user.get("created_at", datetime.utcnow())
        )

        return user_response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user by ID error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/update", response_model=UserResponse)
async def update_user_profile(
    update_data: UserUpdateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update user profile information"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        users_collection = db.users

        # Prepare update data
        update_dict = {}
        if update_data.full_name:
            update_dict["full_name"] = update_data.full_name
        if update_data.phone:
            update_dict["phone"] = update_data.phone
        if update_data.city:
            update_dict["city"] = update_data.city
        if update_data.state:
            update_dict["state"] = update_data.state
        if update_data.health_profile:
            update_dict["health_profile"] = update_data.health_profile.dict()
        
        update_dict["updated_at"] = datetime.utcnow()

        # Update user
        result = await users_collection.update_one(
            {"email": email},
            {"$set": update_dict}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Get updated user
        updated_user = await users_collection.find_one({"email": email})
        
        user_response = UserResponse(
            id=str(updated_user["_id"]),
            user_id=updated_user["user_id"],
            full_name=updated_user["full_name"],
            email=updated_user["email"],
            phone=updated_user["phone"],
            date_of_birth=updated_user["date_of_birth"],
            city=updated_user["city"],
            state=updated_user["state"],
            role=updated_user["role"],
            is_active=updated_user["is_active"],
            health_profile=updated_user.get("health_profile", {}),
            created_at=updated_user.get("created_at", datetime.utcnow())
        )

        return user_response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user profile error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/health-condition")
async def add_health_condition(
    condition_data: HealthConditionRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Add a new health condition"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        users_collection = db.users

        # Create new health condition
        new_condition = HealthCondition(
            **condition_data.dict(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Add to user's health profile
        result = await users_collection.update_one(
            {"email": email},
            {
                "$push": {"health_profile.health_conditions": new_condition.dict()},
                "$set": {"health_profile.last_updated": datetime.utcnow()}
            }
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {"message": "Health condition added successfully", "condition_id": new_condition.id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add health condition error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding health condition"
        )

@router.put("/health-condition/{condition_id}")
async def update_health_condition(
    condition_id: str,
    condition_data: HealthConditionRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update an existing health condition"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        users_collection = db.users

        # Update the specific health condition
        update_data = condition_data.dict()
        update_data["updated_at"] = datetime.utcnow()

        result = await users_collection.update_one(
            {"email": email, "health_profile.health_conditions.id": condition_id},
            {
                "$set": {
                    f"health_profile.health_conditions.$": {
                        "id": condition_id,
                        **update_data,
                        "created_at": datetime.utcnow()  # This should be preserved from original
                    },
                    "health_profile.last_updated": datetime.utcnow()
                }
            }
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Health condition not found"
            )

        return {"message": "Health condition updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update health condition error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating health condition"
        )

@router.delete("/health-condition/{condition_id}")
async def delete_health_condition(
    condition_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete a health condition"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        users_collection = db.users

        result = await users_collection.update_one(
            {"email": email},
            {
                "$pull": {"health_profile.health_conditions": {"id": condition_id}},
                "$set": {"health_profile.last_updated": datetime.utcnow()}
            }
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {"message": "Health condition deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete health condition error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting health condition"
        )

@router.post("/disease-history")
async def add_disease_history(
    disease_data: DiseaseHistoryRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Add a new disease history entry"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        users_collection = db.users

        new_disease = DiseaseHistory(
            **disease_data.dict(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        result = await users_collection.update_one(
            {"email": email},
            {
                "$push": {"health_profile.disease_history": new_disease.dict()},
                "$set": {"health_profile.last_updated": datetime.utcnow()}
            }
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {"message": "Disease history added successfully", "disease_id": new_disease.id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add disease history error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding disease history"
        )

@router.put("/disease-history/{disease_id}")
async def update_disease_history(
    disease_id: str,
    disease_data: DiseaseHistoryRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update an existing disease history entry"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        users_collection = db.users

        update_data = disease_data.dict()
        update_data["updated_at"] = datetime.utcnow()

        result = await users_collection.update_one(
            {"email": email, "health_profile.disease_history.id": disease_id},
            {
                "$set": {
                    f"health_profile.disease_history.$": {
                        "id": disease_id,
                        **update_data,
                        "created_at": datetime.utcnow()
                    },
                    "health_profile.last_updated": datetime.utcnow()
                }
            }
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Disease history not found"
            )

        return {"message": "Disease history updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update disease history error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating disease history"
        )

@router.delete("/disease-history/{disease_id}")
async def delete_disease_history(
    disease_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete a disease history entry"""
    try:
        email = verify_token(credentials.credentials)
        db = get_database()
        users_collection = db.users

        result = await users_collection.update_one(
            {"email": email},
            {
                "$pull": {"health_profile.disease_history": {"id": disease_id}},
                "$set": {"health_profile.last_updated": datetime.utcnow()}
            }
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {"message": "Disease history deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete disease history error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting disease history"
        )
