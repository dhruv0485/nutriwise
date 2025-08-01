import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URL from environment variable
MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise ValueError("MONGODB_URL environment variable is required")

client: AsyncIOMotorClient = None

async def connect_to_mongo():
    """Connect to MongoDB"""
    global client
    client = AsyncIOMotorClient(MONGODB_URL)
    
async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()

def get_database():
    """Get database instance"""
    return client.Diet
