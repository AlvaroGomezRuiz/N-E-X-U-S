import os
import csv
import requests
from tqdm import tqdm
import sys

# --- 1. COORDENADAS DE IMPACTO ---

# RUTA EXACTA DEL CSV (METADATA)
# Asumimos que la estructura es la estándar que hemos creado
BASE_PROJECT = r"E:\ALVARO\COSAS_IMPORTANTES\DAM_PYTHON\NEXUS"
METADATA_PATH = os.path.join(BASE_PROJECT, "metadata", "unsplash_lite", "photos.csv000")

# RUTA EXACTA DE DESTINO (LA QUE TÚ HAS ORDENADO)
DEST_DIR = r"E:\ALVARO\COSAS_IMPORTANTES\DAM_PYTHON\NEXUS\DATA_RAW_IMAGES\HIGH_QUALITY"

# --- 2. CONFIGURACIÓN DE FUEGO ---
TIMEOUT_SEC = 20
MAX_DOWNLOADS = 0  # 0 = INFINITO (Descarga todo el dataset).

# --- 3. MOTOR DE DESCARGA INTELIGENTE ---
def download_image(url, filename):
    try:
        save_path = os.path.join(DEST_DIR, filename)
        
        # SISTEMA DE CACHÉ:
        # Si el archivo ya existe y pesa más de 0 bytes, NO lo descargamos.
        # Esto permite cancelar y reanudar cuando quieras.
        if os.path.exists(save_path) and os.path.getsize(save_path) > 0:
            return "SKIPPED" 

        # Añadimos parámetros para calidad HD (w=1080)
        # Esto evita bajar los RAW de 50MB que saturan el disco innecesariamente.
        target_url = f"{url}?w=1080&q=80"

        with requests.get(target_url, stream=True, timeout=TIMEOUT_SEC) as r:
            r.raise_for_status()
            with open(save_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        return "SUCCESS"
    
    except Exception:
        # Si falla (404, internet caído), borramos el archivo corrupto si se creó
        if os.path.exists(save_path) and os.path.getsize(save_path) == 0:
            os.remove(save_path)
        return "FAIL"

# --- 4. EJECUCIÓN ---
def main():
    print("--------------------------------------------------")
    print("🚀 NEXUS UNSPLASH DOWNLOADER (REANUDACIÓN)")
    print(f"🎯 Destino: {DEST_DIR}")
    print(f"📂 Mapa: {METADATA_PATH}")
    print("--------------------------------------------------")

    # Verificaciones de seguridad
    if not os.path.exists(DEST_DIR):
        print(f"⚠️ La carpeta no existía. Creándola...")
        os.makedirs(DEST_DIR)

    if not os.path.exists(METADATA_PATH):
        print(f"❌ ERROR CRÍTICO: No encuentro el archivo de metadatos en:")
        print(f"   {METADATA_PATH}")
        sys.exit(1)

    print("📡 Conectando con la base de datos de Unsplash...")
    
    success = 0
    skipped = 0
    fails = 0

    # ABRIMOS COMO TSV (Tabulaciones)
    with open(METADATA_PATH, 'r', encoding='utf-8', errors='replace') as f:
        # Saltamos la cabecera
        next(f) 
        
        reader = csv.reader(f, delimiter='\t')
        
        # Barra de carga (Estimamos 25.000 fotos)
        total_estimado = 25000
        pbar = tqdm(total=total_estimado, unit="img", desc="Procesando")

        for row in reader:
            # Lógica de parada si MAX_DOWNLOADS > 0
            if MAX_DOWNLOADS > 0 and success >= MAX_DOWNLOADS:
                break
            
            try:
                # Índices confirmados: ID=0, URL=2
                if len(row) < 3: continue 

                img_id = row[0]
                img_url = row[2]

                if not img_url.startswith("http"): continue

                filename = f"{img_id}.jpg"
                
                status = download_image(img_url, filename)
                
                if status == "SUCCESS":
                    success += 1
                elif status == "SKIPPED":
                    skipped += 1
                else:
                    fails += 1
                
                pbar.update(1)
            
            except Exception:
                fails += 1
                continue
        
        pbar.close()

    print("\n✅ OPERACIÓN COMPLETADA.")
    print(f"📥 Nuevas descargas: {success}")
    print(f"⏭️  Ya existentes (Saltadas): {skipped}")
    print(f"💥 Fallos: {fails}")
    print(f"📁 Ubicación final: {DEST_DIR}")

if __name__ == "__main__":
    main()