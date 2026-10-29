# Copia los iconos y la pantalla de carga del juego al proyecto de Android.
# Uso (después de «npx cap add android»): python3 app/iconos-android.py
import os
from PIL import Image
base = os.path.dirname(os.path.abspath(__file__))
res = os.path.join(base, "android", "app", "src", "main", "res")
icono = Image.open(os.path.join(base, "iconos", "icono-512.png")).convert("RGBA")
mask = Image.open(os.path.join(base, "iconos", "icono-maskable-512.png")).convert("RGBA")
for d, s in {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}.items():
    carpeta = os.path.join(res, "mipmap-" + d)
    icono.resize((s, s), Image.LANCZOS).save(os.path.join(carpeta, "ic_launcher.png"))
    # redondo: recorte circular
    r = icono.resize((s, s), Image.LANCZOS); m = Image.new("L", (s, s), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(m).ellipse((0, 0, s - 1, s - 1), fill=255); r.putalpha(m)
    r.save(os.path.join(carpeta, "ic_launcher_round.png"))
    fg = round(s * 108 / 48)
    mask.resize((fg, fg), Image.LANCZOS).save(os.path.join(carpeta, "ic_launcher_foreground.png"))
# color de fondo del icono adaptable
vals = os.path.join(res, "values", "ic_launcher_background.xml")
open(vals, "w").write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#1A0C06</color>\n</resources>\n')
# pantallas de carga: fondo de cueva con el icono en el centro
for dirpath, _, files in os.walk(res):
    for f in files:
        if f == "splash.png":
            path = os.path.join(dirpath, f); w, h = Image.open(path).size
            img = Image.new("RGBA", (w, h), (26, 12, 6, 255)); s = int(min(w, h) * 0.42)
            img.alpha_composite(icono.resize((s, s), Image.LANCZOS), ((w - s) // 2, (h - s) // 2))
            img.convert("RGB").save(path)
print("Iconos de Android actualizados")
