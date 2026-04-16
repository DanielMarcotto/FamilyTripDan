#!/usr/bin/env python3
"""
Script per generare le icone foreground Android con sfondo bianco per le icone round.
Questo risolve il problema del logo tagliato nelle icone round.
"""

import os
from PIL import Image

# Configurazione
ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images')
ANDROID_RES_DIR = os.path.join(os.path.dirname(__file__), '..', 'android', 'app', 'src', 'main', 'res')

# Safe area per icone round (50% centrale con padding bianco)
# Per le icone round serve più padding perché la maschera circolare taglia di più
# 50% significa 25% di padding bianco su ogni lato
# Questo garantisce che il contenuto sia sempre visibile anche con maschere circolari aggressive
SAFE_AREA_RATIO = 0.50

# Dimensioni per le icone foreground Android (in px)
ICON_SIZES = {
    'mdpi': 108,    # 1x
    'hdpi': 162,    # 1.5x
    'xhdpi': 216,   # 2x
    'xxhdpi': 324,  # 3x
    'xxxhdpi': 432, # 4x
}

# Dimensioni per le icone legacy (non adattive) per compatibilità
LEGACY_ICON_SIZES = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
}

def create_round_icon_with_white_bg(foreground_image, target_size=1024, safe_area_ratio=SAFE_AREA_RATIO):
    """
    Crea un'icona foreground con sfondo bianco e logo centrato.
    Questo garantisce che il logo non venga tagliato nelle icone round.
    
    Args:
        foreground_image: Immagine PIL del logo originale
        target_size: Dimensione del canvas finale (default 1024x1024)
        safe_area_ratio: Percentuale del canvas da usare per il logo (default 0.60 = 60%)
    
    Returns:
        Immagine PIL di target_size x target_size con logo centrato su sfondo bianco
    """
    # Crea un canvas bianco
    canvas = Image.new('RGBA', (target_size, target_size), (255, 255, 255, 255))
    
    # Calcola la dimensione della safe area
    safe_area_size = int(target_size * safe_area_ratio)
    
    # Ridimensiona l'immagine per adattarsi alla safe area
    img_width, img_height = foreground_image.size
    scale = min(safe_area_size / img_width, safe_area_size / img_height)
    new_width = int(img_width * scale)
    new_height = int(img_height * scale)
    
    resized = foreground_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Centra l'immagine nel canvas
    x_offset = (target_size - new_width) // 2
    y_offset = (target_size - new_height) // 2
    
    # Incolla l'immagine ridimensionata al centro su sfondo bianco
    canvas.paste(resized, (x_offset, y_offset), resized if resized.mode == 'RGBA' else None)
    
    return canvas

def extract_logo_from_icon(icon_image):
    """
    Estrae il logo dall'icona rimuovendo lo sfondo colorato.
    Mantiene solo gli elementi del logo (testo, forme, ecc.)
    """
    # Converti in RGBA se non lo è già
    img = icon_image.convert('RGBA')
    width, height = img.size
    
    # Crea una nuova immagine trasparente
    logo_only = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    
    # Itera sui pixel e mantieni solo quelli che non sono parte dello sfondo
    # Lo sfondo è tipicamente un gradiente o colore uniforme ai bordi
    pixels = img.load()
    logo_pixels = logo_only.load()
    
    # Analizza i colori ai bordi per identificare lo sfondo
    edge_colors = []
    for x in [0, width-1]:
        for y in range(height):
            edge_colors.append(pixels[x, y][:3])
    for y in [0, height-1]:
        for x in range(width):
            edge_colors.append(pixels[x, y][:3])
    
    # Calcola il colore medio dello sfondo
    if edge_colors:
        avg_bg = (
            sum(c[0] for c in edge_colors) // len(edge_colors),
            sum(c[1] for c in edge_colors) // len(edge_colors),
            sum(c[2] for c in edge_colors) // len(edge_colors)
        )
    else:
        avg_bg = (255, 255, 255)
    
    # Soglia per considerare un pixel come parte dello sfondo
    threshold = 30
    
    # Copia solo i pixel che non sono parte dello sfondo
    for y in range(height):
        for x in range(width):
            pixel = pixels[x, y]
            r, g, b, a = pixel
            
            # Se il pixel è trasparente, mantienilo trasparente
            if a < 128:
                continue
            
            # Calcola la distanza dal colore medio dello sfondo
            dist = ((r - avg_bg[0])**2 + (g - avg_bg[1])**2 + (b - avg_bg[2])**2)**0.5
            
            # Se è abbastanza diverso dallo sfondo, è parte del logo
            if dist > threshold:
                logo_pixels[x, y] = pixel
    
    return logo_only

def generate_round_icons():
    """Genera le icone foreground con sfondo bianco per tutte le densità."""
    
    print("🎨 Generazione icone foreground con sfondo bianco per icone round...\n")
    
    # Prova a caricare l'icona originale dagli assets
    original_icon_paths = [
        os.path.join(ASSETS_DIR, 'icon.png'),
        os.path.join(ASSETS_DIR, 'adaptive-icon.png'),
    ]
    
    source_image = None
    source_path = None
    
    for path in original_icon_paths:
        if os.path.exists(path):
            print(f"📂 Caricamento icona originale da: {path}")
            original = Image.open(path).convert('RGBA')
            
            # Estrai solo il logo (rimuovi lo sfondo colorato)
            print("   Estrazione logo (rimozione sfondo colorato)...")
            source_image = extract_logo_from_icon(original)
            source_path = path
            break
    
    # Se non troviamo l'icona originale, prova con le icone foreground esistenti
    if not source_image:
        print("⚠️  Icona originale non trovata, uso icona foreground esistente...")
        source_paths = [
            os.path.join(ANDROID_RES_DIR, 'mipmap-xxxhdpi', 'ic_launcher_foreground.webp'),
            os.path.join(ANDROID_RES_DIR, 'mipmap-xxhdpi', 'ic_launcher_foreground.webp'),
            os.path.join(ANDROID_RES_DIR, 'mipmap-xhdpi', 'ic_launcher_foreground.webp'),
            os.path.join(ANDROID_RES_DIR, 'mipmap-hdpi', 'ic_launcher_foreground.webp'),
        ]
        
        for path in source_paths:
            if os.path.exists(path):
                source_image = Image.open(path).convert('RGBA')
                source_path = path
                print(f"📂 Caricamento icona sorgente da: {path}")
                break
    
    if not source_image:
        print("❌ Errore: Nessuna icona trovata!")
        print("   Assicurati che esista assets/images/icon.png o assets/images/adaptive-icon.png")
        return False
    
    # Crea una versione base con sfondo bianco (1024x1024)
    print(f"\n🖼️  Creazione icona base con sfondo bianco ({int(SAFE_AREA_RATIO * 100)}% centrale)...")
    base_icon = create_round_icon_with_white_bg(source_image, target_size=1024, safe_area_ratio=SAFE_AREA_RATIO)
    
    # Genera le icone foreground per ogni densità (Android 8.0+)
    print("\n📦 Generazione icone foreground (Android 8.0+):")
    for density, size in ICON_SIZES.items():
        mipmap_dir = os.path.join(ANDROID_RES_DIR, f'mipmap-{density}')
        os.makedirs(mipmap_dir, exist_ok=True)
        
        # Ridimensiona l'icona base
        resized = base_icon.resize((size, size), Image.Resampling.LANCZOS)
        
        # Salva come WebP
        output_path = os.path.join(mipmap_dir, 'ic_launcher_foreground.webp')
        resized.save(output_path, 'WEBP', quality=100)
        print(f"  ✓ {density}: {size}x{size}px -> {output_path}")
    
    # Genera anche le icone legacy (Android < 8.0) per compatibilità
    print("\n📦 Generazione icone legacy (Android < 8.0):")
    for density, size in LEGACY_ICON_SIZES.items():
        mipmap_dir = os.path.join(ANDROID_RES_DIR, f'mipmap-{density}')
        os.makedirs(mipmap_dir, exist_ok=True)
        
        # Ridimensiona l'icona base
        resized = base_icon.resize((size, size), Image.Resampling.LANCZOS)
        
        # Salva come WebP (sia normale che round)
        output_path = os.path.join(mipmap_dir, 'ic_launcher.webp')
        resized.save(output_path, 'WEBP', quality=100)
        
        output_path_round = os.path.join(mipmap_dir, 'ic_launcher_round.webp')
        resized.save(output_path_round, 'WEBP', quality=100)
        print(f"  ✓ {density}: {size}x{size}px -> {output_path} (e round)")
    
    print("\n✅ Tutte le icone sono state generate con successo!")
    print(f"\n💡 Le icone ora hanno:")
    print(f"   - Sfondo bianco attorno al logo")
    print(f"   - Logo centrato con padding del {int((1-SAFE_AREA_RATIO)*100/2)}% su ogni lato")
    print(f"   - Nessun elemento tagliato nelle icone round")
    print(f"\n📱 Icone generate:")
    print(f"   - Adaptive icons (Android 8.0+): ic_launcher_foreground.webp")
    print(f"   - Legacy icons (Android < 8.0): ic_launcher.webp e ic_launcher_round.webp")
    print(f"\n📱 Ricompila l'app per vedere le modifiche!")
    
    return True

if __name__ == '__main__':
    generate_round_icons()
