# --- BLOQUE DE IMPORTACIONES (LAS HERRAMIENTAS) ---
import os  # Librería del Sistema Operativo. Nos permite leer variables de entorno y borrar archivos del disco.
import requests  # El estándar de la industria para hacer peticiones HTTP (Navegar por internet vía código).
import time  # Nos permite pausar la ejecución. Vital para no saturar servidores ajenos (Rate Limiting).
from pathlib import Path  # La forma moderna (OOP) de manejar rutas de archivos. Mucho mejor que usar strings simples.

# Pydantic: Nuestra "Policía de Datos".
# BaseModel: La clase base para crear esquemas de datos.
# HttpUrl: Un tipo de dato especial que valida si un texto es una URL real (https://...).
# ValidationError: El error que salta si los datos no cumplen las reglas.
# ConfigDict: Configuración avanzada para modelos en Pydantic V2 (corrige el aviso amarillo).
from pydantic import BaseModel, HttpUrl, ValidationError, ConfigDict 

# Dotenv: Librería de seguridad que lee el archivo oculto .env para no tener claves en el código.
from dotenv import load_dotenv

# --- 1. FASE DE SEGURIDAD (OPSec) ---
# Carga las variables del archivo .env en la memoria RAM del proceso.
load_dotenv() 

# Intenta obtener la clave secreta de la memoria.
API_KEY = os.getenv("PEXELS_API_KEY")

# VALIDACIÓN "FAIL FAST" (Fallar Rápido):
# Si no hay clave, detenemos el programa INMEDIATAMENTE.
# No tiene sentido seguir si no podemos autenticarnos.
if not API_KEY:
    raise ValueError("❌ FATAL: No se ha encontrado la API KEY en el archivo .env")

# --- 2. CONFIGURACIÓN DE RUTA (INFRAESTRUCTURA) ---
# Definimos dónde guardaremos el botín.
# Usamos r"" (raw string) para que Python ignore las barras invertidas (\) típicas de Windows.
# Path() convierte ese texto en un OBJETO INTELIGENTE que sabe crear carpetas, unir rutas, etc.
DOWNLOAD_DIR = Path(r"E:\ALVARO\COSAS_IMPORTANTES\DAM_PYTHON\NEXUS\dataset_raw")

# --- 3. CONTRATO DE DATOS (PYDANTIC V2) ---
# Esta clase define CÓMO debe ser una imagen válida para entrar en NEXUS.
# Actúa como un filtro de calidad.
class NexusImage(BaseModel):
    # CONFIGURACIÓN DEL MODELO:
    # frozen=True hace que los objetos sean INMUTABLES (Solo lectura).
    # Una vez creada una imagen, nadie puede cambiar su URL o ID por error. Esto previene bugs.
    model_config = ConfigDict(frozen=True)

    id: int           # Debe ser un número entero.
    url: HttpUrl      # Debe ser una dirección web válida (comienza por http/https).
    width: int        # Ancho en píxeles.
    height: int       # Alto en píxeles.
    photographer: str # Nombre del autor.

# --- 4. ESTRATEGIA DE BÚSQUEDA (MATRIZ DE OBJETIVOS) ---
# Una lista de conceptos visuales. El script buscará uno por uno.
# Esto asegura variedad en el dataset (no solo fotos de una cosa).
LISTA_OBJETIVOS = [
    "solarpunk city architecture",    # Ciudad verde y tecnológica
    "vertical forest skyscraper",     # Rascacielos con árboles
    "futuristic singapore gardens",   # Referencia visual clave
    "green eco city sci fi",          # Ciencia ficción ecológica
    "biophilic architecture night"    # Arquitectura orgánica nocturna
]

CANTIDAD_POR_OBJETIVO = 10  # Descargaremos 10 de cada tema (Total: 50 fotos).

# --- FUNCIÓN PRINCIPAL (EL CEREBRO / ORQUESTADOR) ---
def validar_y_descargar():
    # GESTIÓN DE DIRECTORIOS:
    # .mkdir -> Crea el directorio.
    # parents=True -> Si no existen las carpetas intermedias, créalas también.
    # exist_ok=True -> Si la carpeta ya existe, no des error, sigue adelante.
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📂 Búnker Confirmado en: {DOWNLOAD_DIR}")

    # Cabeceras HTTP: Es como el DNI que enseñamos al servidor de Pexels para que nos deje pasar.
    headers = {"Authorization": API_KEY}
    
    # --- BUCLE MAESTRO (OUTER LOOP) ---
    # Recorremos la lista de objetivos uno a uno.
    for objetivo in LISTA_OBJETIVOS:
        print(f"\n📡 ESCANEANDO SECTOR: '{objetivo}'...")
        
        # Construcción de la URL dinámica (F-String).
        # Inyectamos el 'objetivo' actual en la petición.
        url = f"https://api.pexels.com/v1/search?query={objetivo}&per_page={CANTIDAD_POR_OBJETIVO}&orientation=landscape"

        try:
            # PETICIÓN HTTP:
            # Llamamos a la API. timeout=10 significa "Si en 10 segundos no respondes, cuelgo".
            # Esto evita que el programa se quede congelado eternamente si falla internet.
            response = requests.get(url, headers=headers, timeout=10)
            
            # Verificación de Estado:
            # Si el código es 200 (OK) -> Seguimos.
            # Si es 401 (No autorizado) o 404 (No encontrado) -> Lanza una excepción y salta al 'except'.
            response.raise_for_status()
            
            # Parseo JSON: Convertimos el texto recibido en un diccionario de Python.
            data = response.json()
            # Extraemos la lista de fotos. Si no existe la clave, devolvemos una lista vacía [].
            fotos_crudas = data.get("photos", [])

            # Lógica de flujo: Si no hay fotos, saltamos al siguiente objetivo.
            if not fotos_crudas:
                print(f"⚠️ Sector vacío: '{objetivo}'")
                continue # 'continue' fuerza el salto a la siguiente iteración del bucle 'for'.

            print(f"   ✓ Detectados {len(fotos_crudas)} objetivos.")

            # --- SUB-BUCLE (INNER LOOP) ---
            # Procesamos cada foto encontrada para este objetivo específico.
            for foto_raw in fotos_crudas:
                try:
                    # VALIDACIÓN DE DATOS (PYDANTIC):
                    # Intentamos meter los datos crudos en nuestro molde 'NexusImage'.
                    # Si los datos están mal (ej: falta la URL), Pydantic lanza un error ValidationError.
                    imagen_valida = NexusImage(
                        id=foto_raw["id"],
                        url=foto_raw["src"]["original"], # Queremos la calidad original (HD).
                        width=foto_raw["width"],
                        height=foto_raw["height"],
                        photographer=foto_raw["photographer"]
                    )
                    
                    # Si llegamos aquí, la imagen es válida.
                    # Pasamos el trabajo al "Obrero" (función descargar_archivo).
                    descargar_archivo(imagen_valida)

                except ValidationError as e:
                    # Si la foto está corrupta, solo descartamos esa foto y seguimos con la siguiente.
                    print(f"⚠️ Dato corrupto ID {foto_raw.get('id')}: {e}")

        except Exception as e:
            # Captura errores generales de conexión (ej: WiFi caído) para este objetivo.
            print(f"🔥 Error de conexión en sector '{objetivo}': {e}")
            # Pausa de seguridad antes de reintentar o seguir.
            time.sleep(1) 
            
    print("\n✅ MISIÓN CUMPLIDA. TODAS LAS IMÁGENES ASEGURADAS.")

# --- FUNCIÓN WORKER (EL OBRERO / GESTIÓN DE I/O) ---
# Esta función se encarga del trabajo sucio: escribir en el disco duro.
def descargar_archivo(img: NexusImage):
    filename = f"{img.id}.jpg" # Nombre del archivo: 12345.jpg
    filepath = DOWNLOAD_DIR / filename # Ruta completa: E:\...\12345.jpg

    # SISTEMA DE CACHÉ:
    # Si el archivo ya existe, NO lo descargamos de nuevo.
    # Ahorramos ancho de banda y cupo de la API.
    if filepath.exists():
        print(f"⏭️  [CACHE] {filename} ya existe.")
        return

    print(f"⬇️  Descargando: {filename}...")
    
    try:
        # DESCARGA POR STREAMING (OPTIMIZACIÓN DE RAM):
        # stream=True abre la conexión pero NO descarga el contenido de golpe.
        with requests.get(str(img.url), stream=True, timeout=20) as r:
            r.raise_for_status()
            
            # Abrimos el archivo en modo 'wb' (Write Binary) porque es una imagen, no texto.
            with open(filepath, 'wb') as f:
                # iter_content descarga el archivo en trocitos (chunks) de 8KB (8192 bytes).
                # Esto permite descargar archivos gigantes (GBs) sin llenar la memoria RAM.
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk) # Escribimos el trocito en el disco.
        
        # Pausa de cortesía para no bombardear al servidor de Pexels.
        time.sleep(0.5) 

    except Exception as e:
        print(f"❌ Error escribiendo {filename}: {e}")
        # AUTO-REPARACIÓN (SELF-HEALING):
        # Si la descarga falla a medias, nos queda un archivo corrupto (mitad de foto).
        # Lo borramos inmediatamente para que no de problemas en el futuro.
        if filepath.exists():
            os.remove(filepath)

# --- PUNTO DE ENTRADA (ENTRY POINT) ---
# Esta condición comprueba si estamos ejecutando este archivo directamente.
# Si lo importamos desde otro script, no se ejecutará nada automáticamente.
if __name__ == "__main__":
    validar_y_descargar()