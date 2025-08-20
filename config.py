import os

try:
    # Load variables from a local .env if present
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    # Safe to ignore if dotenv is not installed or .env is missing
    pass


# Load Gemini configuration from environment
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '').strip()

# Default to the 1.5-flash model which is fast and good for JSON formatting
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash').strip()

# Base URL for Gemini REST API
GEMINI_API_URL = os.getenv('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta').strip()


