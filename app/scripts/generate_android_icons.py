#!/usr/bin/env python3
"""
Script per generare tutte le icone Android nelle varie densità.
Scala l'icona per rispettare la safe area Android (66-70% centrale)
per evitare che gli elementi vengano tagliati dalle maschere adattive.
"""

import os
from PIL import Image
import shutil

# Configurazione
ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images')
ANDROID_RES_DIR = os.path.join(os.path.dirname(__file__), '..', 'android', 'app', 'src', 'main', 'res')

# Safe area per icone adattive Android (66% è la raccomandazione Google)
# Android raccomanda 66x66 dp su 108x108 dp = 66% centrale
# Con padding di 18dp su ogni lato (18/108 = 16.67%)
SAFE_AREA_RATIO = 0.66

# Dimensioni per le icone foreground Android (in px)
# Le icone adattive Android usano 108dp come dimensione base
# Moltiplicate per i fattori di densità
ICON_SIZES = {
    'mdpi': 108,    # 1x
    'hdpi': 162,    # 1.5x
    'xhdpi': 216,   # 2x
    'xxhdpi': 324,  # 3x
    'xxxhdpi': 432, # 4x
}

# Dimensioni per le icone legacy (non adattive)
LEGACY_ICON_SIZES = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
}

def create_safe_area_icon(image, target_size=1024, safe_area_ratio=SAFE_AREA_RATIO):
    """
    Crea un'icona che rispetta la safe area Android.
    Scala l'immagine per adattarla all'area centrale sicura (60% del canvas),
    lasciando padding trasparente intorno. Questo garantisce che tutti gli elementi
    dell'icona siano visibili anche quando Android applica maschere adattive.
    
    Args:
        image: Immagine PIL da scalare
        target_size: Dimensione del canvas finale (default 1024x1024)
        safe_area_ratio: Percentuale del canvas da usare per l'icona (default 0.68 = 68%)
    
    Returns:
        Immagine PIL di target_size x target_size con l'icona scalata e centrata
    """
    # Crea un'immagine trasparente di target_size x target_size
    full_image = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
    
    # Calcola la dimensione della safe area
    safe_area_size = int(target_size * safe_area_ratio)
    
    # Ridimensiona l'immagine per adattarsi alla safe area
    # Mantieni le proporzioni usando il lato più lungo
    img_width, img_height = image.size
    scale = min(safe_area_size / img_width, safe_area_size / img_height)
    new_width = int(img_width * scale)
    new_height = int(img_height * scale)
    
    resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Centra l'immagine nel canvas
    x_offset = (target_size - new_width) // 2
    y_offset = (target_size - new_height) // 2
    
    # Incolla l'immagine ridimensionata al centro
    full_image.paste(resized, (x_offset, y_offset), resized if resized.mode == 'RGBA' else None)
    
    return full_image

def get_average_color(image):
    """
    Calcola il colore medio dell'immagine per usarlo come sfondo Android.
    """
    # Ridimensiona a una piccola immagine per calcolare il colore medio più velocemente
    small = image.resize((100, 100), Image.Resampling.LANCZOS)
    colors = small.getcolors(10000)  # Ottieni fino a 10000 colori
    
    if not colors:
        return "#ffffff"  # Default bianco
    
    # Trova il colore più frequente (escludendo la trasparenza)
    max_count = 0
    dominant_color = (255, 255, 255)
    
    for count, color in colors:
        if len(color) == 4 and color[3] < 128:  # Salta pixel molto trasparenti
            continue
        if count > max_count:
            max_count = count
            dominant_color = color[:3]  # Prendi solo RGB
    
    # Converti in hex
    return f"#{dominant_color[0]:02x}{dominant_color[1]:02x}{dominant_color[2]:02x}"

def generate_icons():
    """Genera tutte le icone Android nelle varie densità."""
    
    # Prova prima con icon.png, poi fallback su adaptive-icon.png
    icon_path = os.path.join(ASSETS_DIR, 'icon.png')
    if not os.path.exists(icon_path):
        icon_path = os.path.join(ASSETS_DIR, 'adaptive-icon.png')
        if not os.path.exists(icon_path):
            print(f"Errore: icon.png o adaptive-icon.png non trovati!")
            return False
    
    print(f"Caricamento icona da: {icon_path}")
    original_image = Image.open(icon_path).convert('RGBA')
    
    # Calcola il colore medio per lo sfondo Android
    avg_color = get_average_color(original_image)
    print(f"Colore medio rilevato: {avg_color}")
    
    # Crea una versione con safe area (1024x1024) che rispetta le linee guida Android
    print(f"Creazione icona con safe area ({int(SAFE_AREA_RATIO * 100)}% centrale)...")
    print(f"  Questo garantisce che tutti gli elementi siano visibili anche con maschere adattive.")
    full_icon = create_safe_area_icon(original_image, target_size=1024, safe_area_ratio=SAFE_AREA_RATIO)
    
    # Genera le icone foreground per ogni densità
    print("\nGenerazione icone foreground:")
    for density, size in ICON_SIZES.items():
        mipmap_dir = os.path.join(ANDROID_RES_DIR, f'mipmap-{density}')
        os.makedirs(mipmap_dir, exist_ok=True)
        
        # Ridimensiona l'icona full-size
        resized = full_icon.resize((size, size), Image.Resampling.LANCZOS)
        
        # Salva come WebP (formato preferito da Android)
        output_path = os.path.join(mipmap_dir, 'ic_launcher_foreground.webp')
        resized.save(output_path, 'WEBP', quality=100)
        print(f"  ✓ {density}: {size}x{size}px -> {output_path}")
    
    # Genera anche le icone legacy (non adattive) per compatibilità
    print("\nGenerazione icone legacy:")
    for density, size in LEGACY_ICON_SIZES.items():
        mipmap_dir = os.path.join(ANDROID_RES_DIR, f'mipmap-{density}')
        os.makedirs(mipmap_dir, exist_ok=True)
        
        # Ridimensiona l'icona full-size
        resized = full_icon.resize((size, size), Image.Resampling.LANCZOS)
        
        # Salva come WebP
        output_path = os.path.join(mipmap_dir, 'ic_launcher.webp')
        resized.save(output_path, 'WEBP', quality=100)
        
        # Salva anche la versione round
        output_path_round = os.path.join(mipmap_dir, 'ic_launcher_round.webp')
        resized.save(output_path_round, 'WEBP', quality=100)
        print(f"  ✓ {density}: {size}x{size}px -> {output_path}")
    
    # Aggiorna il colore di sfondo nel file colors.xml
    colors_xml_path = os.path.join(ANDROID_RES_DIR, 'values', 'colors.xml')
    if os.path.exists(colors_xml_path):
        print(f"\nAggiornamento colore di sfondo in colors.xml...")
        import re
        with open(colors_xml_path, 'r') as f:
            content = f.read()
        
        # Aggiorna il colore iconBackground con il colore medio dell'immagine
        pattern = r'(<color name="iconBackground">)#[0-9a-fA-F]{6}(</color>)'
        replacement = f'\\1{avg_color}\\2'
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            with open(colors_xml_path, 'w') as f:
                f.write(content)
            print(f"  ✓ Colore di sfondo aggiornato a {avg_color}")
        else:
            print(f"  ⚠ Pattern iconBackground non trovato in colors.xml")
    
    print("\n✓ Tutte le icone sono state generate con successo!")
    print(f"\nNota: Le icone sono state create rispettando la safe area Android ({int(SAFE_AREA_RATIO * 100)}%).")
    print("      L'icona è scalata e centrata con padding trasparente intorno.")
    print("      Questo garantisce che tutti gli elementi siano visibili anche quando")
    print("      Android applica maschere adattive (cerchio, quadrato arrotondato, ecc.).")
    print(f"      Colore di sfondo Android: {avg_color}")
    
    return True

if __name__ == '__main__':
    generate_icons()
