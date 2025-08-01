from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta, datetime
import logging

from models.user import UserCreate, UserLogin, UserResponse, UserInDB, Token, HealthProfile
from utils.security import hash_password, verify_password, create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES
from utils.counter import get_next_sequence_value
from database.config import get_database
from utils.email_service import email_service

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """Register a new user with default health profile"""
    try:
        db = get_database()
        users_collection = db.users

        # Check if user already exists
        existing_user = await users_collection.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check if phone number already exists
        existing_phone = await users_collection.find_one({"phone": user_data.phone})
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )

        # Get next user ID
        user_id = await get_next_sequence_value(db, "user_id")

        # Hash the password
        hashed_password = hash_password(user_data.password)

        # Create default health profile
        default_health_profile = HealthProfile()

        # Create user document with timestamps and health profile
        user_dict = user_data.dict()
        del user_dict['password']  # Remove plain password
        user_dict.update({
            'user_id': user_id,
            'hashed_password': hashed_password,
            'role': 'patient',
            'is_active': True,
            'health_profile': default_health_profile.dict(),  # Add default health profile
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        })

        # Insert user into database
        result = await users_collection.insert_one(user_dict)

        # Fetch the created user
        created_user = await users_collection.find_one({"_id": result.inserted_id})

        # Convert to response model
        user_response = UserResponse(
            id=str(created_user["_id"]),
            user_id=created_user["user_id"],
            full_name=created_user["full_name"],
            email=created_user["email"],
            phone=created_user["phone"],
            date_of_birth=created_user["date_of_birth"],
            city=created_user["city"],
            state=created_user["state"],
            role=created_user["role"],
            is_active=created_user["is_active"],
            health_profile=created_user.get("health_profile"),  # Include health profile
            created_at=created_user["created_at"]
        )

        logger.info(f"User registered successfully: {user_data.email} with user_id: {user_id}")
        
        # Send welcome email to user
        try:
            email_service.send_registration_welcome(
                name=user_data.full_name,
                email=user_data.email
            )
        except Exception as email_error:
            logger.error(f"Failed to send welcome email: {str(email_error)}")
        
        # Send notification to admin
        try:
            email_service.send_admin_notification(
                notification_type="New User Registration",
                data={
                    "full_name": user_data.full_name,
                    "email": user_data.email,
                    "phone": user_data.phone,
                    "city": user_data.city,
                    "state": user_data.state,
                    "user_id": user_id,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except Exception as admin_email_error:
            logger.error(f"Failed to send admin notification: {str(admin_email_error)}")
        
        return user_response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during registration"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    try:
        # Verify token and get email
        email = verify_token(credentials.credentials)
        db = get_database()
        users_collection = db.users

        # Find user by email
        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Create default health profile if it doesn't exist
        if "health_profile" not in user:
            default_health_profile = HealthProfile()
            await users_collection.update_one(
                {"email": email},
                {"$set": {"health_profile": default_health_profile.dict()}}
            )
            user["health_profile"] = default_health_profile.dict()

        # Convert to response model
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
            health_profile=user.get("health_profile"),  # Include health profile
            created_at=user.get("created_at", datetime.utcnow())
        )

        return user_response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get current user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Keep your existing login and logout functions exactly the same
@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin):
    """Authenticate user and return access token"""
    try:
        db = get_database()
        users_collection = db.users

        # Find user by email
        user = await users_collection.find_one({"email": user_credentials.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify password
        if not verify_password(user_credentials.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"], "role": user.get("role", "patient")},
            expires_delta=access_token_expires
        )

        logger.info(f"User logged in successfully: {user_credentials.email}")
        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )

@router.post("/logout")
async def logout_user():
    """Logout user (client should remove token)"""
    return {"message": "Successfully logged out"}
