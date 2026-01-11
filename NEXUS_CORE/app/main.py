from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from app.core.config import settings  # Crearemos esto enseguida

app = FastAPI(
    title="NEXUS ENGINE",
    description="Núcleo de Inteligencia Artificial y Arbitraje Visual",
    version="2.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc"
)

# Configuración CORS (Permite que React hable con Python)
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Puerto por defecto de Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    """Ping de diagnóstico del sistema."""
    return {
        "system": "NEXUS_CORE",
        "status": "OPERATIONAL",
        "version": "2.0.0-alpha",
        "message": "Bienvenido, Arquitecto. El sistema escucha."
    }

# Aquí importaremos los routers más adelante
# app.include_router(api_router, prefix="/api/v1")