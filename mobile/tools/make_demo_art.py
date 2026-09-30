"""Create original flat item illustrations for CampusFind's demo database."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
glyphs = json.loads((ROOT / 'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json').read_text())
font_path = ROOT / 'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'
icon_font = ImageFont.truetype(str(font_path), 310)
label_font = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 42)
output = ROOT / 'assets/demo'
output.mkdir(parents=True, exist_ok=True)
items = [
    ('earbuds', 'headset-outline', 'ELECTRONICS', (230, 242, 255), (21, 92, 182)),
    ('id-card', 'id-card-outline', 'ID & CARDS', (255, 239, 224), (225, 96, 20)),
    ('bottle', 'water-outline', 'EVERYDAY', (230, 246, 249), (16, 103, 137)),
    ('backpack', 'bag-handle-outline', 'BAGS', (241, 237, 255), (72, 78, 156)),
    ('notebook', 'book-outline', 'BOOKS', (255, 243, 226), (208, 107, 30)),
    ('keys', 'key-outline', 'KEYS', (232, 243, 255), (30, 101, 179)),
    ('hoodie', 'shirt-outline', 'CLOTHING', (238, 246, 243), (24, 115, 85)),
]
for name, glyph, label, background, ink in items:
    image = Image.new('RGB', (900, 700), background)
    d = ImageDraw.Draw(image)
    d.ellipse((475, -190, 1030, 365), fill=tuple(min(255, x + 10) for x in background))
    d.ellipse((-120, 455, 235, 810), fill=(255, 255, 255))
    d.rounded_rectangle((190, 85, 710, 605), radius=125, fill=(255, 255, 255))
    box = d.textbbox((0, 0), chr(glyphs[glyph]), font=icon_font)
    width, height = box[2] - box[0], box[3] - box[1]
    d.text(((900 - width) / 2 - box[0], (650 - height) / 2 - box[1] - 5), chr(glyphs[glyph]), font=icon_font, fill=ink)
    label_box = d.textbbox((0, 0), label, font=label_font)
    d.rounded_rectangle((31, 31, 31 + label_box[2] + 42, 106), radius=22, fill=(255, 255, 255))
    d.text((52, 42), label, font=label_font, fill=ink)
    image.save(output / f'{name}.png', optimize=True)
print(f'Created {len(items)} original demo illustrations in {output}')
