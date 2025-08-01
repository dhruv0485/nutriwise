from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from database.config import connect_to_mongo, close_mongo_connection
from routes.auth import router as auth_router
from routes.quiz import router as quiz_router
from routes.consultations import router as consultations_router
from routes.myth import router as myth_router  # Add this import
from routes.dietplan import router as diet_router  # Add this import
from routes.user_profile import router as user_profile_router  # Add this import
from routes.goal_tracking import router as goal_tracking_router  # Add this import
from routes.contact import router as contact_router  # Add this import
from routes.chatbot import router as chatbot_router  # Add this import
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="NutriWise API",
    description="A comprehensive nutrition and diet management platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://127.0.0.1:3000",
        "https://nutriwise-frontend.onrender.com",  # Add your frontend URL
        "https://*.onrender.com"  # Allow all Render subdomains
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(quiz_router, prefix="/api")
app.include_router(consultations_router, prefix="/api")
app.include_router(myth_router, prefix="/api")  # Add this line
app.include_router(diet_router, prefix="/api")  # Add this line
app.include_router(user_profile_router, prefix="/api")  # Add this line
app.include_router(goal_tracking_router, prefix="/api")  # Add this line
app.include_router(contact_router, prefix="/api")  # Add this line
app.include_router(chatbot_router, prefix="/api")  # Add this line
@app.get("/")
async def root():
    return {"message": "Welcome to NutriWise API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
