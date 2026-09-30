"""Draw the vector-style CampusFind launch mark at high resolution."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
canvas = Image.new('RGBA', (1000, 1100), (0, 0, 0, 0))
d = ImageDraw.Draw(canvas)
white = '#FFFFFF'
orange = '#F5761B'
navy = '#102A47'

# Soft campus search motif and the app's magnifying-glass mark.
d.ellipse((230, 75, 770, 615), outline=(255, 255, 255, 35), width=4)
d.ellipse((295, 140, 705, 550), outline=(255, 255, 255, 28), width=3)
d.rounded_rectangle((315, 170, 685, 540), radius=92, fill=navy)
d.ellipse((383, 233, 568, 418), outline=white, width=30)
d.line((553, 404, 633, 484), fill=orange, width=37, joint='curve')
d.ellipse((602, 452, 639, 489), fill=orange)

font_bold = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 100)
font_regular = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 36)
name = 'CampusFind'
subtitle = 'Good things find their way back.'
box = d.textbbox((0, 0), name, font=font_bold)
d.text(((1000 - (box[2] - box[0])) / 2, 635), name, font=font_bold, fill=white)
box = d.textbbox((0, 0), subtitle, font=font_regular)
d.text(((1000 - (box[2] - box[0])) / 2, 765), subtitle, font=font_regular, fill='#E5F1FF')
d.rounded_rectangle((455, 855, 545, 867), radius=6, fill=orange)
canvas.save(root / 'assets' / 'splash-brand.png', optimize=True)
