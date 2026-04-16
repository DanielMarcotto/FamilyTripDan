#!/usr/bin/env python3
"""
Script per generare un preview HTML delle icone Android con le varie maschere.
Permette di vedere come apparirà l'icona senza dover buildare l'app.
"""

import os
from PIL import Image, ImageDraw
import base64
from io import BytesIO

# Configurazione
ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images')
ANDROID_RES_DIR = os.path.join(os.path.dirname(__file__), '..', 'android', 'app', 'src', 'main', 'res')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'icon_preview')

def image_to_base64(image):
    """Converte un'immagine PIL in base64 per HTML."""
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def create_mask(shape, size):
    """Crea una maschera per l'icona."""
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    
    if shape == 'circle':
        draw.ellipse([0, 0, size-1, size-1], fill=255)
    elif shape == 'squircle':
        # Approssimazione di uno squircle (cerchio con bordi molto arrotondati)
        radius = size * 0.15
        draw.rounded_rectangle([0, 0, size-1, size-1], radius=int(radius), fill=255)
    elif shape == 'rounded_square':
        radius = size * 0.1
        draw.rounded_rectangle([0, 0, size-1, size-1], radius=int(radius), fill=255)
    else:  # square
        draw.rectangle([0, 0, size-1, size-1], fill=255)
    
    return mask

def create_preview_icon(foreground_path, background_color, shape='circle', size=512, add_white_bg=False):
    """Crea un'anteprima dell'icona con la maschera specificata."""
    # Carica foreground
    if os.path.exists(foreground_path):
        fg = Image.open(foreground_path).convert('RGBA')
    else:
        # Crea un'icona placeholder se non esiste
        fg = Image.new('RGBA', (size, size), (255, 255, 255, 255))
        draw = ImageDraw.Draw(fg)
        draw.text((size//4, size//4), "FT", fill=(0, 0, 0, 255))
    
    # Ridimensiona foreground
    fg = fg.resize((size, size), Image.Resampling.LANCZOS)
    
    # Crea canvas finale
    if add_white_bg:
        # Crea uno sfondo bianco più grande e centra il logo
        canvas_size = size
        canvas = Image.new('RGBA', (canvas_size, canvas_size), (255, 255, 255, 255))
        
        # Scala il logo al 60% per lasciare padding bianco
        logo_size = int(size * 0.6)
        fg_resized = fg.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Centra il logo
        x_offset = (canvas_size - logo_size) // 2
        y_offset = (canvas_size - logo_size) // 2
        canvas.paste(fg_resized, (x_offset, y_offset), fg_resized)
        
        # Crea lo sfondo colorato
        bg = Image.new('RGBA', (size, size), background_color)
        result = Image.new('RGBA', (size, size), background_color)
        result.paste(canvas, (0, 0), canvas)
    else:
        # Versione normale senza sfondo bianco
        bg = Image.new('RGBA', (size, size), background_color)
        result = Image.new('RGBA', (size, size), background_color)
        result.paste(fg, (0, 0), fg)
    
    # Applica maschera
    mask = create_mask(shape, size)
    result.putalpha(mask)
    
    return result

def generate_preview_html():
    """Genera un file HTML con i preview delle icone."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Trova il foreground
    foreground_path = os.path.join(ANDROID_RES_DIR, 'mipmap-xxhdpi', 'ic_launcher_foreground.webp')
    if not os.path.exists(foreground_path):
        foreground_path = os.path.join(ANDROID_RES_DIR, 'mipmap-xhdpi', 'ic_launcher_foreground.webp')
    if not os.path.exists(foreground_path):
        foreground_path = os.path.join(ANDROID_RES_DIR, 'mipmap-hdpi', 'ic_launcher_foreground.webp')
    
    # Leggi il colore di sfondo
    colors_xml = os.path.join(ANDROID_RES_DIR, 'values', 'colors.xml')
    bg_color = "#0fb2b1"  # Default
    if os.path.exists(colors_xml):
        import re
        with open(colors_xml, 'r') as f:
            content = f.read()
            match = re.search(r'<color name="iconBackground">(#[\da-fA-F]{6})</color>', content)
            if match:
                bg_color = match.group(1)
    
    # Converti hex in RGB
    bg_rgb = tuple(int(bg_color[i:i+2], 16) for i in (1, 3, 5))
    
    shapes = [
        ('circle', 'Cerchio (Round)'),
        ('squircle', 'Squircle'),
        ('rounded_square', 'Quadrato Arrotondato'),
        ('square', 'Quadrato')
    ]
    
    html_content = """
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview Icone Android - FamilyTrip</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .section {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            margin-top: 0;
            color: #555;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .icons-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            margin-top: 20px;
        }
        .icon-preview {
            text-align: center;
        }
        .icon-preview h3 {
            margin: 10px 0;
            color: #666;
            font-size: 14px;
        }
        .icon-image {
            width: 128px;
            height: 128px;
            margin: 0 auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            background: white;
            padding: 10px;
        }
        .info {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info strong {
            color: #1976d2;
        }
    </style>
</head>
<body>
    <h1>🎨 Preview Icone Android - FamilyTrip</h1>
    
    <div class="info">
        <strong>ℹ️ Informazioni:</strong><br>
        Questo preview mostra come apparirà l'icona con le varie maschere Android.<br>
        <strong>Versione Standard:</strong> Logo direttamente su sfondo colorato<br>
        <strong>Versione con Sfondo Bianco:</strong> Logo centrato con padding bianco (consigliata per icone round)
    </div>
    
    <div class="section">
        <h2>📱 Versione Standard</h2>
        <div class="icons-grid">
"""
    
    # Genera preview standard
    for shape, label in shapes:
        preview = create_preview_icon(foreground_path, bg_rgb, shape, size=512, add_white_bg=False)
        img_base64 = image_to_base64(preview)
        html_content += f"""
            <div class="icon-preview">
                <img src="{img_base64}" alt="{label}" class="icon-image">
                <h3>{label}</h3>
            </div>
"""
    
    html_content += """
        </div>
    </div>
    
    <div class="section">
        <h2>⚪ Versione con Sfondo Bianco (Consigliata per Round)</h2>
        <div class="icons-grid">
"""
    
    # Genera preview con sfondo bianco
    for shape, label in shapes:
        preview = create_preview_icon(foreground_path, bg_rgb, shape, size=512, add_white_bg=True)
        img_base64 = image_to_base64(preview)
        html_content += f"""
            <div class="icon-preview">
                <img src="{img_base64}" alt="{label}" class="icon-image">
                <h3>{label}</h3>
            </div>
"""
    
    html_content += """
        </div>
    </div>
    
    <div class="info">
        <strong>💡 Suggerimento:</strong><br>
        Se vedi che il logo viene tagliato nella versione "Cerchio (Round)", usa la versione con sfondo bianco.<br>
        Per applicare questa modifica, esegui: <code>python scripts/generate_android_icons_round.py</code>
    </div>
</body>
</html>
"""
    
    output_path = os.path.join(OUTPUT_DIR, 'preview.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Preview generato: {output_path}")
    print(f"   Apri il file nel browser per vedere le anteprime!")
    return output_path

if __name__ == '__main__':
    generate_preview_html()
