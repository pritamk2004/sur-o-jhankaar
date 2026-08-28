import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", 8000))
    API_KEY: str = os.getenv("PYTHON_ENGINE_API_KEY", "sur_o_jhankaar_internal_api_key_secure_2026")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()
