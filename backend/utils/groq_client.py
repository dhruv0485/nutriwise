from groq import Groq
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Get Groq API key from environment variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")

# Initialize a single Groq client instance
groq_client = Groq(
    api_key=GROQ_API_KEY,
)

def get_groq_client():
    """Get the shared Groq client instance"""
    return groq_client 