from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List
import logging
from bson import ObjectId

from models.consultation import (
    BookingCreate, 
    ConsultationBookingResponse, 
    ConsultationBookingInDB,
    Dietitian
)
from utils.security import verify_token
from utils.counter import get_next_sequence_value
from database.config import get_database
from utils.email_service import email_service

router = APIRouter(prefix="/consultations", tags=["Consultations"])
security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/dietitians", response_model=List[dict])
async def get_available_dietitians():
    """Get list of available dietitians"""
    try:
        db = get_database()
        dietitians_collection = db.dietitians
        
        # For now, return sample data. You can populate this collection later
        sample_dietitians = [
            {
                "_id": ObjectId("507f1f77bcf86cd799439011"),
                "name": "Dr. Priya Singh",
                "specialization": "Clinical Nutritionist & Dietitian",
                "experience": 8,
                "rating": 4.8,
                "bio": "Specialized in weight management, diabetes care, and sports nutrition. Certified clinical nutritionist with expertise in personalized diet plans.",
                "profile_image": "https://images.pexels.com/photos/3376790/photo-1582750433449-648ed127bb54?auto=compress&cs=tinysrgb&w=400",
                "available_slots": [
                    {"date": "2025-08-05", "time": "09:00", "is_available": True},
                    {"date": "2025-08-05", "time": "10:00", "is_available": True},
                    {"date": "2025-08-06", "time": "14:00", "is_available": True},
                ]
            },
            {
                "_id": ObjectId(),
                "name": "Dr. Sarah Johnson",
                "specialization": "Weight Management & Nutrition",
                "experience": 8,
                "rating": 4.8,
                "bio": "Specialized in sustainable weight loss and metabolic health.",
                "profile_image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
                "available_slots": [
                    {"date": "2025-08-05", "time": "09:00", "is_available": True},
                    {"date": "2025-08-05", "time": "10:00", "is_available": True},
                    {"date": "2025-08-06", "time": "14:00", "is_available": True},
                ]
            },
            {
                "_id": ObjectId(),
                "name": "Dr. Michael Chen",
                "specialization": "Sports Nutrition & Performance",
                "experience": 12,
                "rating": 4.9,
                "bio": "Expert in athletic performance optimization and sports nutrition.",
                "profile_image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
                "available_slots": [
                    {"date": "2025-08-05", "time": "11:00", "is_available": True},
                    {"date": "2025-08-06", "time": "09:00", "is_available": True},
                    {"date": "2025-08-07", "time": "15:00", "is_available": True},
                ]
            },
            {
                "_id": ObjectId(),
                "name": "Dr. Emily Rodriguez",
                "specialization": "Clinical Nutrition & Diabetes",
                "experience": 10,
                "rating": 4.7,
                "bio": "Specializes in diabetes management and clinical nutrition therapy.",
                "profile_image": "https://images.unsplash.com/photo-1594824980330-4e35b2c3b5e4?w=400",
                "available_slots": [
                    {"date": "2025-08-05", "time": "13:00", "is_available": True},
                    {"date": "2025-08-06", "time": "10:00", "is_available": True},
                    {"date": "2025-08-07", "time": "11:00", "is_available": True},
                ]
            }
        ]
        
        # Convert ObjectId to string for JSON serialization
        for dietitian in sample_dietitians:
            dietitian["_id"] = str(dietitian["_id"])
        
        return sample_dietitians
        
    except Exception as e:
        logger.error(f"Error fetching dietitians: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching dietitians"
        )

@router.post("/book", response_model=ConsultationBookingResponse)
async def book_consultation(
    booking_data: BookingCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Book a new consultation"""
    try:
        # Verify token and get user email
        email = verify_token(credentials.credentials)
        
        db = get_database()
        users_collection = db.users
        bookings_collection = db.consultation_bookings
        
        # Get current user
        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Validate dietitian exists (for now, we'll skip this check since we're using sample data)
        try:
            dietitian_oid = ObjectId(booking_data.dietitian_id)
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid dietitian ID"
            )
        
        # Get next booking ID
        booking_id = await get_next_sequence_value(db, "booking_id")
        
        # Create booking document
        booking_dict = booking_data.dict()
        booking_dict.update({
            "patient_id": user["_id"],
            "patient_user_id": user.get("user_id", 0),
            "dietitian_id": dietitian_oid,
            "booking_id": booking_id,
            "status": "scheduled",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        # Generate meeting link for video calls
        if booking_data.consultation_type == "video_call":
            booking_dict["meeting_link"] = f"https://meet.nutriwise.com/room/{booking_id}"
        
        # Insert booking
        result = await bookings_collection.insert_one(booking_dict)
        
        # Fetch the created booking with dietitian details
        created_booking = await bookings_collection.find_one({"_id": result.inserted_id})
        
        # Get dietitian details (using sample data for now)
        sample_dietitians = {
            "507f1f77bcf86cd799439011": {
                "name": "Dr. Priya Singh",
                "specialization": "Clinical Nutritionist & Dietitian",
                "profile_image": "https://images.pexels.com/photos/3376790/photo-1582750433449-648ed127bb54?auto=compress&cs=tinysrgb&w=400"
            },
            str(booking_data.dietitian_id): {
                "name": "Dr. Sarah Johnson",
                "specialization": "Weight Management & Nutrition",
                "profile_image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400"
            }
        }
        
        dietitian_info = sample_dietitians.get(booking_data.dietitian_id, {
            "name": "Dr. Unknown",
            "specialization": "General Nutrition",
            "profile_image": None
        })
        
        # Create response
        booking_response = ConsultationBookingResponse(
            id=str(created_booking["_id"]),
            booking_id=created_booking["booking_id"],
            patient_user_id=created_booking["patient_user_id"],
            dietitian=dietitian_info,
            consultation_type=created_booking["consultation_type"],
            appointment_date=created_booking["appointment_date"],
            appointment_time=created_booking["appointment_time"],
            duration=created_booking["duration"],
            notes=created_booking["notes"],
            status=created_booking["status"],
            meeting_link=created_booking.get("meeting_link"),
            created_at=created_booking["created_at"]
        )
        
        logger.info(f"Consultation booked successfully: booking_id {booking_id}")
        
        # Send confirmation email to user
        try:
            consultation_data = {
                "dietitian_name": dietitian_info["name"],
                "date": booking_data.appointment_date,
                "time": booking_data.appointment_time,
                "method": booking_data.consultation_type.replace("_", " ").title(),
                "price": "1500" if booking_data.consultation_type == "video_call" else "1200" if booking_data.consultation_type == "phone_call" else "2000"
            }
            
            email_service.send_consultation_confirmation(
                name=user["full_name"],
                email=user["email"],
                consultation_data=consultation_data
            )
        except Exception as email_error:
            logger.error(f"Failed to send consultation confirmation email: {str(email_error)}")
        
        # Send notification to admin
        try:
            email_service.send_admin_notification(
                notification_type="New Consultation Booking",
                data={
                    "patient_name": user["full_name"],
                    "patient_email": user["email"],
                    "dietitian_name": dietitian_info["name"],
                    "consultation_type": booking_data.consultation_type,
                    "appointment_date": booking_data.appointment_date,
                    "appointment_time": booking_data.appointment_time,
                    "booking_id": booking_id,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except Exception as admin_email_error:
            logger.error(f"Failed to send admin notification: {str(admin_email_error)}")
        
        return booking_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error booking consultation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error booking consultation"
        )

@router.get("/my-bookings", response_model=List[ConsultationBookingResponse])
async def get_my_bookings(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current user's consultation bookings"""
    try:
        # Verify token and get user email
        email = verify_token(credentials.credentials)
        
        db = get_database()
        users_collection = db.users
        bookings_collection = db.consultation_bookings
        
        # Get current user
        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Fetch user's bookings
        bookings_cursor = bookings_collection.find({"patient_id": user["_id"],"patient_user_id": user["user_id"]})
        bookings = await bookings_cursor.to_list(length=None)
        
        # Sample dietitian data for responses
        sample_dietitians_data = {
            "Dr. Priya Singh": {
                "name": "Dr. Priya Singh",
                "specialization": "Clinical Nutritionist & Dietitian",
                "profile_image": "https://images.pexels.com/photos/3376790/photo-1582750433449-648ed127bb54?auto=compress&cs=tinysrgb&w=400"
            },
            "Dr. Sarah Johnson": {
                "name": "Dr. Sarah Johnson",
                "specialization": "Weight Management & Nutrition",
                "profile_image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400"
            },
            "Dr. Michael Chen": {
                "name": "Dr. Michael Chen",
                "specialization": "Sports Nutrition & Performance", 
                "profile_image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"
            }
        }
        
        # Convert to response format
        booking_responses = []
        for booking in bookings:
            # Get dietitian info (you'll need to implement proper lookup later)
            dietitian_info = list(sample_dietitians_data.values())[0]  # Default for now
            
            booking_response = ConsultationBookingResponse(
                id=str(booking["_id"]),
                booking_id=booking["booking_id"],
                patient_user_id=booking["patient_user_id"],
                dietitian=dietitian_info,
                consultation_type=booking["consultation_type"],
                appointment_date=booking["appointment_date"],
                appointment_time=booking["appointment_time"],
                duration=booking["duration"],
                notes=booking["notes"],
                status=booking["status"],
                meeting_link=booking.get("meeting_link"),
                created_at=booking["created_at"]
            )
            booking_responses.append(booking_response)
        
        return booking_responses
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching bookings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching bookings"
        )

@router.put("/cancel/{booking_id}")
async def cancel_booking(
    booking_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Cancel a consultation booking"""
    try:
        # Verify token and get user email
        email = verify_token(credentials.credentials)
        
        db = get_database()
        users_collection = db.users
        bookings_collection = db.consultation_bookings
        
        # Get current user
        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update booking status
        result = await bookings_collection.update_one(
            {"booking_id": booking_id, "patient_id": user["_id"]},
            {
                "$set": {
                    "status": "cancelled",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        return {"message": "Booking cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error cancelling booking"
        )
