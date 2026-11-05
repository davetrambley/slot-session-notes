from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / 'slot-session-notes' / 'extension' / 'icons'
root.mkdir(parents=True, exist_ok=True)
# Simple code-native journal mark; no downloaded artwork or external assets.
for size in (16, 48, 128):
    scale = 4
    im = Image.new('RGBA', (size * scale, size * scale), (16, 25, 27, 255))
    d = ImageDraw.Draw(im)
    def box(coords, fill, radius=0):
        coords = [int(n * size * scale) for n in coords]
        if radius:
            d.rounded_rectangle(coords, radius=int(radius * size * scale), fill=fill)
        else:
            d.rectangle(coords, fill=fill)
    box((.16, .12, .84, .88), '#baf0cb', .08)
    box((.27, .30, .72, .35), '#183229')
    box((.27, .47, .72, .52), '#183229')
    box((.27, .64, .55, .69), '#183229')
    im.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icon{size}.png')
