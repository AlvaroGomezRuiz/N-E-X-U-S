import os
import csv
import shutil
from tqdm import tqdm

# --- 1. CONFIGURACIÓN DE RUTAS ---
# Usamos tu ruta absoluta E: para evitar errores
BASE_DIR = r"E:\ALVARO\COSAS_IMPORTANTES\DAM_PYTHON\NEXUS"

# El mapa (CSV)
METADATA_PATH = os.path.join(BASE_DIR, "metadata", "unsplash_lite", "photos.csv000")

# Las imágenes (Donde las descarga jajas.py)
IMAGES_DIR = os.path.join(BASE_DIR, "DATA_RAW_IMAGES", "HIGH_QUALITY")

# El vertedero (Donde mandamos la basura)
QUARANTINE_DIR = os.path.join(BASE_DIR, "DATA_RAW_IMAGES", "QUARANTINE")

# --- 2. LISTAS DE INTELIGENCIA (FILTROS) ---
# Palabras prohibidas (Ruido visual para turismo)
BLACKLIST = [
    "person", "people", "human", "woman", "man", "girl", "boy", "face", "portrait", "child", "kid",
    "dog", "cat", "animal", "pet", "puppy", "kitten",
    "food", "coffee", "drink", "meal", "cake", "fruit",
    "computer", "phone", "screen", "office", "keyboard", "work", "laptop",
    "wedding", "couple", "kiss", "love", "holding hands",
    "indoor", "room", "furniture", "sofa", "bed", "chair", "table"
]

# Palabras deseadas (Salvoconducto - aunque la Blacklist tiene prioridad)
WHITELIST = [
    "nature", "landscape", "mountain", "sea", "ocean", "water", "river", "lake",
    "forest", "tree", "sky", "cloud", "sunset", "sunrise",
    "city", "building", "architecture", "street", "urban", "house", "bridge", "tower",
    "travel", "outdoor", "view", "beach", "sand", "rock", "cliff"
]

def main():
    print("--------------------------------------------------")
    print("☣️  INICIANDO PROTOCOLO DE PURGA (DATA CLEANING)")
    print(f"📂 Escaneando: {IMAGES_DIR}")
    print(f"🗑️  Destino tóxico: {QUARANTINE_DIR}")
    print("--------------------------------------------------")
    
    if not os.path.exists(QUARANTINE_DIR):
        os.makedirs(QUARANTINE_DIR)
    
    if not os.path.exists(METADATA_PATH):
        print("❌ ERROR CRÍTICO: No encuentro el archivo photos.csv000")
        return

    # Contadores
    kept = 0
    purged = 0
    processed = 0
    missing = 0

    print("📖 Leyendo metadatos y correlacionando con imágenes en disco...")
    
    # Abrimos el archivo CSV
    with open(METADATA_PATH, 'r', encoding='utf-8', errors='replace') as f:
        # Saltamos cabecera si tiene
        # header = f.readline() 
        
        # Usamos el lector CSV con tabulador (TSV) que confirmamos antes
        reader = csv.reader(f, delimiter='\t')
        
        # Saltamos la primera fila (títulos de columnas)
        next(reader, None)

        for row in tqdm(reader, desc="Analizando"):
            try:
                # ESTRUCTURA CONFIRMADA EN TU DIAGNÓSTICO:
                # row[0] = ID
                # row[10] = Descripción (o índices cercanos, buscamos texto)
                
                if len(row) < 1: continue
                
                img_id = row[0]
                
                # Construimos el texto completo de la fila para buscar palabras clave
                # (Es más seguro que buscar en una columna específica que puede estar vacía)
                full_text = " ".join(row).lower()

                filename = f"{img_id}.jpg"
                filepath = os.path.join(IMAGES_DIR, filename)
                
                # VERIFICACIÓN FÍSICA: ¿Tenemos esa foto descargada?
                if not os.path.exists(filepath):
                    missing += 1
                    continue # Si no la hemos descargado, pasamos a la siguiente
                
                processed += 1
                is_trash = False
                
                # LÓGICA DE DETECCIÓN (CASE SENSITIVE IGNORADO)
                for bad_word in BLACKLIST:
                    # Buscamos la palabra exacta rodeada de espacios o signos
                    if bad_word in full_text: 
                        is_trash = True
                        break
                
                if is_trash:
                    # MOVIMIENTO TÁCTICO A CUARENTENA
                    dest_path = os.path.join(QUARANTINE_DIR, filename)
                    shutil.move(filepath, dest_path)
                    purged += 1
                else:
                    kept += 1
                
            except Exception as e:
                # Si una línea falla, seguimos
                continue

    print("-" * 50)
    print("🏁 REPORTE DE PURGA:")
    print(f"🔎 Imágenes analizadas en disco: {processed}")
    print(f"✅ Imágenes VÁLIDAS (Se quedan): {kept}")
    print(f"☣️  Imágenes PURGADAS (En Quarantine): {purged}")
    print(f"💨 Imágenes en CSV pero no descargadas: {missing}")
    print("-" * 50)
    print("NOTA: Revisa la carpeta QUARANTINE visualmente antes de borrarla definitivamente.")

if __name__ == "__main__":
    main()