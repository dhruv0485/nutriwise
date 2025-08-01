from fastapi import APIRouter, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime
import logging
from models.contact import ContactRequest, ContactResponse
from utils.counter import get_next_sequence_value
from database.config import get_database
from utils.email_service import email_service

router = APIRouter(prefix="/contact", tags=["Contact"])
logger = logging.getLogger(__name__)

@router.post("/submit", response_model=ContactResponse)
async def submit_contact_form(contact_data: ContactRequest):
    """Submit a contact form message"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        # Create contact document
        contact_doc = {
            "id": str(await get_next_sequence_value(db, "contact")),
            "name": contact_data.name,
            "email": contact_data.email,
            "phone": contact_data.phone,
            "subject": contact_data.subject,
            "message": contact_data.message,
            "created_at": datetime.utcnow(),
            "status": "pending"
        }
        
        # Insert into database
        result = await db.contacts.insert_one(contact_doc)
        
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to save contact message")
        
        # Return the created contact
        contact_doc["_id"] = result.inserted_id
        logger.info(f"Contact form submitted successfully: {contact_data.email}")
        
        # Send confirmation email to user
        try:
            email_service.send_contact_confirmation(
                name=contact_data.name,
                email=contact_data.email,
                subject=contact_data.subject,
                message=contact_data.message
            )
        except Exception as email_error:
            logger.error(f"Failed to send contact confirmation email: {str(email_error)}")
        
        # Send notification to admin
        try:
            email_service.send_admin_notification(
                notification_type="New Contact Form Submission",
                data={
                    "name": contact_data.name,
                    "email": contact_data.email,
                    "phone": contact_data.phone,
                    "subject": contact_data.subject,
                    "message": contact_data.message,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except Exception as admin_email_error:
            logger.error(f"Failed to send admin notification: {str(admin_email_error)}")
        
        return ContactResponse(**contact_doc)
        
    except Exception as e:
        logger.error(f"Error submitting contact form: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to submit contact form. Please try again later."
        )

@router.get("/messages", response_model=list[ContactResponse])
async def get_contact_messages():
    """Get all contact messages (for admin purposes)"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        cursor = db.contacts.find().sort("created_at", -1)
        contacts = await cursor.to_list(length=100)
        
        return [ContactResponse(**contact) for contact in contacts]
        
    except Exception as e:
        logger.error(f"Error fetching contact messages: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to fetch contact messages"
        )

@router.put("/{contact_id}/status")
async def update_contact_status(contact_id: str, status: str):
    """Update contact message status"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        if status not in ["pending", "read", "replied", "closed"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        result = await db.contacts.update_one(
            {"id": contact_id},
            {"$set": {"status": status}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Contact message not found")
        
        return {"message": "Status updated successfully"}
        
    except Exception as e:
        logger.error(f"Error updating contact status: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to update contact status"
        ) 