from PIL import Image, ImageDraw, ImageFilter
import random, math, os

random.seed(17)
p = 'public/assets/tracks/textures/'
os.makedirs(p, exist_ok=True)

def make_asphalt(filename, base, grain_amp, streak_amp):
    w, h = 256, 256
    im = Image.new('RGB', (w, h))
    pix = im.load()
    rng = random.Random(17 if 'worn' not in filename else 42)
    # Generate longitudinal roller streaks + fine aggregate speckle
    col_bias = [math.sin(x * 0.15) * streak_amp + rng.uniform(-streak_amp * 0.5, streak_amp * 0.5) for x in range(w)]
    for y in range(h):
        row_wave = math.cos(y * 0.08) * 2.5
        for x in range(w):
            n = rng.randint(-grain_amp, grain_amp)
            # Occasional bright stone aggregate or dark bitumen speck
            speck = 10 if rng.random() < 0.06 else (-9 if rng.random() < 0.07 else 0)
            delta = int(col_bias[x] + row_wave + n + speck)
            pix[x, y] = tuple(max(0, min(255, v + delta)) for v in base)
    im.save(p + filename)

make_asphalt('asphalt.png', (56, 60, 64), 11, 4.0)
make_asphalt('asphalt-worn.png', (64, 67, 70), 13, 5.5)

# Grass texture with subtle organic turf variation and mowing bands
def make_grass(filename, base):
    w, h = 256, 256
    im = Image.new('RGB', (w, h))
    pix = im.load()
    rng = random.Random(99)
    for y in range(h):
        for x in range(w):
            band = math.sin(x * 0.09817) * 4.5 + math.cos(y * 0.09817) * 3.0
            n = rng.randint(-12, 12)
            blade = 6 if (x + y * 3) % 7 == 0 else 0
            d = int(band + n + blade)
            pix[x, y] = (
                max(0, min(255, base[0] + int(d * 0.85))),
                max(0, min(255, base[1] + d)),
                max(0, min(255, base[2] + int(d * 0.75))),
            )
    im.save(p + filename)

make_grass('grass.png', (66, 84, 54))

# Gravel / dirt texture with arrestor bed furrows
def make_dirt(filename, base):
    w, h = 256, 256
    im = Image.new('RGB', (w, h))
    pix = im.load()
    rng = random.Random(123)
    for y in range(h):
        furrow = math.sin(y * 0.3927) * 8.0
        for x in range(w):
            n = rng.randint(-14, 14)
            pebble = 12 if rng.random() < 0.08 else (-10 if rng.random() < 0.08 else 0)
            d = int(furrow + n + pebble)
            pix[x, y] = tuple(max(0, min(255, v + d)) for v in base)
    im.save(p + filename)

make_dirt('dirt.png', (138, 118, 88))

# Concrete texture with subtle panel joints and fine grain
def make_concrete(filename, base):
    w, h = 256, 256
    im = Image.new('RGB', (w, h))
    pix = im.load()
    rng = random.Random(314)
    for y in range(h):
        joint_y = -10 if y % 64 in (0, 63) else 0
        for x in range(w):
            joint_x = -8 if x % 128 in (0, 127) else 0
            n = rng.randint(-8, 8) + joint_x + joint_y
            pix[x, y] = tuple(max(0, min(255, v + n)) for v in base)
    im.save(p + filename)

make_concrete('concrete.png', (164, 168, 165))

# Kerb red-white texture with 3D bevel edge and rubber scuffing
im = Image.new('RGB', (128, 128), (232, 234, 228))
d = ImageDraw.Draw(im)
d.rectangle((0, 0, 127, 63), fill=(208, 28, 48))
# Subtle mortar seam between blocks
d.rectangle((0, 0, 127, 2), fill=(150, 20, 34))
d.rectangle((0, 62, 127, 65), fill=(175, 178, 172))
d.rectangle((0, 125, 127, 127), fill=(175, 178, 172))
# Longitudinal bevel highlight and inner shadow
for x in range(128):
    for y in range(128):
        r, g, b = im.getpixel((x, y))
        edge = 1.0
        if x < 10:
            edge = 0.84 + 0.016 * x
        elif x > 116:
            edge = 0.86 + 0.01 * (127 - x)
        elif 14 <= x <= 26:
            edge = 1.06
        scuff = 0.92 if (20 < x < 70 and ((x * 7 + y * 13) % 29 == 0)) else 1.0
        f = edge * scuff
        im.putpixel((x, y), (max(0, min(255, int(r * f))), max(0, min(255, int(g * f))), max(0, min(255, int(b * f)))))
im.save(p + 'kerb-red-white.png')

# Track line texture
im = Image.new('RGBA', (64, 64))
d = ImageDraw.Draw(im)
d.rectangle((22, 0, 41, 63), fill=(242, 239, 224, 255))
im.save(p + 'track-line.png')

# Braking marks texture
im = Image.new('RGBA', (128, 128))
d = ImageDraw.Draw(im)
for x in [24, 32, 88, 96]:
    for y in range(128):
        alpha = int(78 * (1 - abs(y - 64) / 64))
        d.line((x, y, x + 5, y), fill=(12, 14, 17, alpha))
im.save(p + 'braking-marks.png')

# v0.7 neutral terrain grain: desert and snow must not inherit green grass.
neutral_rng = random.Random(7017)
im = Image.new('RGB', (256, 256))
pix = im.load()
for y in range(256):
    wave = math.sin(y * 0.07) * 4
    for x in range(256):
        v = max(0, min(255, int(216 + wave + math.cos(x * 0.07) * 4 + neutral_rng.randint(-10, 10))))
        pix[x, y] = (v, v, v)
im.save(p + 'terrain-neutral.png')
