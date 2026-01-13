from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXUS"
    API_V1_STR: str = "/api/v1"
    
    # Esto intentará leer variables desde tu archivo .env automáticamente
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()