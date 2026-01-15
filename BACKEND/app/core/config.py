import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXUS"
    API_V1_STR: str = "/api/v1"

    # VARIABLES QDRANT
    QDRANT_HOST: str = "localhost" # Donde esta Docker.
    QDRANT_PORT: int = 6333 # Que puerto utiliza.
    QDRANT_COLLECTION: str = "nexus_vectors" # Donde guardar los resultados.

    # COORDENADAS CEREBRO IA
    MODEL_NAME: str = "openai/clip-vit-base-patch32"

    # COORDENADAS DE LAS IMAGENES RAW
    IMAGES_DIR: str = "C:/dev/NEXUS/DATA/RAW" # Carpeta de imagenes RAW

    # Esto intentará leer variables desde tu archivo .env automáticamente
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
