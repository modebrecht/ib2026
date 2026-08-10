"""
Konvertiert alle JPG/PNG-Dateien in einem Ordner nach WebP (höchste Qualität).
Originaldateien werden NICHT gelöscht oder verändert.

Verwendung:
    python convert_to_webp.py <ordner>
    python convert_to_webp.py assets
"""

import sys
import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow nicht installiert. Installiere mit: pip install Pillow")
    sys.exit(1)


def convert_to_webp(folder: str):
    folder_path = Path(folder)
    if not folder_path.is_dir():
        print(f"Fehler: '{folder}' ist kein gültiger Ordner.")
        sys.exit(1)

    extensions = {'.jpg', '.jpeg', '.png'}
    files = [f for f in folder_path.iterdir() if f.is_file() and f.suffix.lower() in extensions]

    if not files:
        print(f"Keine JPG/PNG-Dateien in '{folder}' gefunden.")
        return

    print(f"Gefunden: {len(files)} Dateien zum Konvertieren\n")

    converted = 0
    skipped = 0

    for f in sorted(files):
        webp_path = f.with_suffix('.webp')

        if webp_path.exists():
            print(f"  SKIP  {f.name}  ->  {webp_path.name} (existiert bereits)")
            skipped += 1
            continue

        try:
            img = Image.open(f)
            # RGBA beibehalten für PNG-Transparenz
            img.save(webp_path, 'WEBP', quality=100, lossless=True, method=6)
            
            orig_kb = f.stat().st_size / 1024
            new_kb = webp_path.stat().st_size / 1024
            print(f"  OK    {f.name}  ->  {webp_path.name}  ({orig_kb:.0f} KB -> {new_kb:.0f} KB)")
            converted += 1
        except Exception as e:
            print(f"  FAIL  {f.name}  ->  {e}")

    print(f"\nFertig: {converted} konvertiert, {skipped} übersprungen.")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Verwendung: python convert_to_webp.py <ordner>")
        print("Beispiel:   python convert_to_webp.py assets")
        sys.exit(1)

    convert_to_webp(sys.argv[1])
