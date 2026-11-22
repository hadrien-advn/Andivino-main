"""Packshots carrés sur fond blanc pour Google Shopping / Merchant Center.

Lit chaque photo de bouteille de data/wines.js (champ image.src) et écrit
assets/images/shopping/<id>.jpg : carré blanc, bouteille centrée sur 90 % de la
hauteur, sans agrandissement. À relancer quand une photo de bouteille change :
    python3 scripts/shopping-images.py
"""
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

SITE = Path(__file__).resolve().parent.parent
wines = json.loads(subprocess.check_output(
    ["node", "-e", "console.log(JSON.stringify(require('./data/wines').WINES.map(w => ({id: w.id, src: w.image && w.image.src}))))"],
    cwd=SITE))

out_dir = SITE / "assets/images/shopping"
out_dir.mkdir(parents=True, exist_ok=True)
for w in wines:
    if not w["src"]:
        print(f"{w['id']}: pas de photo de bouteille, ignoré", file=sys.stderr)
        continue
    src = Image.open(SITE / w["src"].lstrip("/")).convert("RGBA")
    bbox = src.getchannel("A").getbbox()
    if bbox:
        src = src.crop(bbox)
    side = round(src.height / 0.9)
    canvas = Image.new("RGB", (side, side), "white")
    canvas.paste(src, ((side - src.width) // 2, (side - src.height) // 2), src)
    canvas.save(out_dir / f"{w['id']}.jpg", "JPEG", quality=88, optimize=True, progressive=True)
    print(f"{w['id']}: {side}x{side}")
