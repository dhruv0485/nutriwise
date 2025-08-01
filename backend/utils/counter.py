from motor.motor_asyncio import AsyncIOMotorDatabase

async def get_next_sequence_value(db: AsyncIOMotorDatabase, sequence_name: str) -> int:
    """Get the next sequence value for auto-incrementing IDs"""
    
    counters_collection = db.counters
    
    # Find and update the counter, or create it if it doesn't exist
    result = await counters_collection.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"sequence_value": 1}},
        upsert=True,
        return_document=True  # Return the updated document
    )
    
    # If this is the first time, the sequence_value will be 1
    return result["sequence_value"]
