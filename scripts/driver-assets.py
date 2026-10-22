from PIL import Image, ImageDraw, ImageFont
import os, json, subprocess, math

raw = subprocess.check_output(
    [
        "node",
        "--input-type=module",
        "-e",
        "import{driverCatalog}from'./src/data/drivers.js';console.log(JSON.stringify(driverCatalog));",
    ]
)
pilots = json.loads(raw)

skins = [
    ("#eab696", "#c98b68", "#a86b4a"),
    ("#d59872", "#b47550", "#8f5636"),
    ("#f3cbb2", "#d4a184", "#b27c60"),
    ("#8d5b42", "#6d422c", "#512e1d"),
    ("#bd825e", "#996240", "#764629"),
    ("#f0c1a0", "#cfa07f", "#ad7b5b"),
    ("#744832", "#573321", "#3e2214"),
    ("#deb08d", "#bc8967", "#996848"),
]

hair_colors = [
    "#181b22",
    "#3a261a",
    "#633f26",
    "#12151c",
    "#8c5832",
    "#c6934b",
    "#272224",
    "#4f2b1d",
    "#9b4728",
    "#2f3540",
]

eye_colors = [
    "#3b6e8c",
    "#4b3621",
    "#3c6e47",
    "#2d3748",
    "#5c4033",
    "#2b6cb0",
    "#68513c",
]

accents = ["#f1f5f9", "#fbbf24", "#38bdf8", "#facc15", "#a7f3d0", "#fb923c"]


def hex_to_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[j : j + 2], 16) for j in (0, 2, 4))


def mix(c1, c2, t):
    return tuple(int(c1[k] * (1 - t) + c2[k] * t) for k in range(3))


def draw_driver_portrait(pilot):
    i = pilot["id"]
    W, H = 768, 864
    im = Image.new("RGB", (W, H), (11, 17, 27))
    d = ImageDraw.Draw(im, "RGBA")

    suit_rgb = hex_to_rgb(pilot.get("suitColor") or pilot["color"])
    helm_rgb = hex_to_rgb(pilot.get("helmetColor") or pilot["color"])
    acc_rgb = hex_to_rgb("#d7eaa0" if i == 30 else accents[i % len(accents)])
    dark_suit = mix(suit_rgb, (14, 20, 30), 0.58)
    light_suit = mix(suit_rgb, (255, 255, 255), 0.25)

    # 1. Studio Backdrop with subtle vignette and diagonal team light beam
    for y in range(H):
        t = y / H
        bg = mix((18, 27, 42), (9, 13, 21), t)
        d.line((0, y, W, y), fill=(*bg, 255))

    # Diagonal team color studio accent stripes
    d.polygon(
        [(0, int(H * 0.18)), (W, 0), (W, int(H * 0.28)), (0, int(H * 0.48))],
        fill=(*suit_rgb, 42),
    )
    d.polygon(
        [(0, int(H * 0.52)), (W, int(H * 0.32)), (W, int(H * 0.37)), (0, int(H * 0.57))],
        fill=(*acc_rgb, 28),
    )

    # Subtle studio glow behind shoulders/head (soft dark-blended ring)
    glow_bg = mix(suit_rgb, (16, 24, 38), 0.62)
    d.ellipse(
        (W // 2 - 285, int(H * 0.42) - 285, W // 2 + 285, int(H * 0.42) + 285),
        fill=(*glow_bg, 110),
        outline=(*suit_rgb, 110),
        width=4,
    )

    # 2. Sculpted Racing Suit Shoulders, Torso, Epaulettes & Collar
    cx = W // 2
    shoulder_w = 275 + (i % 3) * 10
    neck_y = 515

    # Main suit torso polygon
    d.polygon(
        [
            (cx - shoulder_w, H),
            (cx - shoulder_w + 26, 635),
            (cx - 108, 558),
            (cx + 108, 558),
            (cx + shoulder_w - 26, 635),
            (cx + shoulder_w, H),
        ],
        fill=(*suit_rgb, 255),
    )

    # Dark carbon side torso panels
    d.polygon(
        [
            (cx - shoulder_w, H),
            (cx - shoulder_w + 26, 635),
            (cx - 135, 578),
            (cx - 110, H),
        ],
        fill=(*dark_suit, 255),
    )
    d.polygon(
        [
            (cx + shoulder_w, H),
            (cx + shoulder_w - 26, 635),
            (cx + 135, 578),
            (cx + 110, H),
        ],
        fill=(*dark_suit, 255),
    )

    # White/Accent Chest Livery & Quilted Racing Seams
    d.polygon(
        [
            (cx - 116, 566),
            (cx + 116, 566),
            (cx + 88, H),
            (cx - 88, H),
        ],
        fill=(241, 245, 249, 255),
    )
    d.polygon(
        [
            (cx - 78, 635),
            (cx + 78, 635),
            (cx + 62, H),
            (cx - 62, H),
        ],
        fill=(*suit_rgb, 255),
    )
    # Center zipper line
    d.rectangle((cx - 5, 555, cx + 5, H), fill=(22, 30, 44, 255))

    # Shoulder Epaulettes (FIA pull straps)
    d.polygon(
        [(cx - 215, 614), (cx - 112, 556), (cx - 95, 580), (cx - 196, 636)],
        fill=(*acc_rgb, 255),
    )
    d.polygon(
        [(cx + 215, 614), (cx + 112, 556), (cx + 95, 580), (cx + 196, 636)],
        fill=(*acc_rgb, 255),
    )

    # Sponsor / Team Chest Stripes
    d.rectangle((cx - 175, 695, cx - 102, 716), fill=(*acc_rgb, 255))
    d.rectangle((cx + 102, 695, cx + 175, 716), fill=(*acc_rgb, 255))
    d.rectangle((cx - 52, 678, cx + 52, 704), fill=(20, 28, 42, 255))
    d.rectangle((cx - 46, 684, cx + 46, 698), fill=(*acc_rgb, 255))

    if i == 30:
        # Mega Baxter (#30): Cybernetic Full-Face Legend Helmet Portrait
        d.polygon(
            [
                (cx - 165, 385),
                (cx - 145, 210),
                (cx - 70, 145),
                (cx + 70, 145),
                (cx + 145, 210),
                (cx + 165, 385),
                (cx + 125, 548),
                (cx - 125, 548),
            ],
            fill=(32, 42, 36, 255),
            outline=(212, 249, 144, 255),
            width=6,
        )
        # Crown Aero Fins
        d.polygon(
            [(cx - 95, 165), (cx - 45, 95), (cx, 135), (cx + 45, 95), (cx + 95, 165)],
            fill=(48, 62, 52, 255),
            outline=(212, 249, 144, 255),
            width=4,
        )
        # Visor aperture & glowing neon visor
        d.polygon(
            [
                (cx - 138, 305),
                (cx + 138, 305),
                (cx + 150, 388),
                (cx + 112, 430),
                (cx - 112, 430),
                (cx - 150, 388),
            ],
            fill=(14, 22, 28, 255),
        )
        d.polygon(
            [
                (cx - 126, 322),
                (cx + 126, 322),
                (cx + 134, 382),
                (cx - 134, 382),
            ],
            fill=(196, 247, 132, 255),
        )
        d.polygon(
            [(cx - 105, 328), (cx - 25, 328), (cx - 55, 376), (cx - 115, 376)],
            fill=(240, 255, 215, 220),
        )
    else:
        # 3. Human Neck, Head, Facial Structure, Eyes, Nose, Mouth & Hair
        skin_main, skin_mid, skin_shadow = skins[i % len(skins)]
        skin_rgb = hex_to_rgb(skin_main)
        skin_mid_rgb = hex_to_rgb(skin_mid)
        skin_sh_rgb = hex_to_rgb(skin_shadow)

        # Neck & shading
        d.rectangle((cx - 58, 450, cx + 58, 568), fill=(*skin_mid_rgb, 255))
        d.polygon(
            [(cx - 58, 465), (cx + 58, 465), (cx + 58, 515), (cx - 58, 535)],
            fill=(*skin_sh_rgb, 180),
        )

        # High Fireproof Nomex Suit Collar wrapping neck base
        d.polygon(
            [
                (cx - 114, 522),
                (cx - 64, 508),
                (cx, 534),
                (cx + 64, 508),
                (cx + 114, 522),
                (cx + 108, 574),
                (cx - 108, 574),
            ],
            fill=(28, 37, 52, 255),
        )
        d.line(
            [(cx - 110, 526), (cx, 548), (cx + 110, 526)],
            fill=(*acc_rgb, 255),
            width=6,
        )

        # Ears
        ear_y = 335
        d.ellipse((cx - 146, ear_y, cx - 108, ear_y + 74), fill=(*skin_mid_rgb, 255))
        d.ellipse((cx + 108, ear_y, cx + 146, ear_y + 74), fill=(*skin_mid_rgb, 255))

        # Head / Jaw shape (varied jaw width by driver id)
        jaw_w = 112 + (i % 4) * 5
        chin_w = 46 + (i % 3) * 6
        d.polygon(
            [
                (cx - 124, 248),
                (cx - 126, 355),
                (cx - jaw_w, 428),
                (cx - chin_w, 488),
                (cx + chin_w, 488),
                (cx + jaw_w, 428),
                (cx + 126, 355),
                (cx + 124, 248),
            ],
            fill=(*skin_rgb, 255),
        )
        # Forehead dome
        d.ellipse((cx - 125, 168, cx + 125, 345), fill=(*skin_rgb, 255))

        # Subtle symmetrical cheekbone & chin contour shading
        d.polygon(
            [
                (cx - 124, 355),
                (cx - jaw_w, 428),
                (cx - chin_w, 488),
                (cx - chin_w + 18, 470),
                (cx - jaw_w + 18, 415),
            ],
            fill=(*skin_mid_rgb, 120),
        )
        d.polygon(
            [
                (cx + 124, 355),
                (cx + jaw_w, 428),
                (cx + chin_w, 488),
                (cx + chin_w - 18, 470),
                (cx + jaw_w - 18, 415),
            ],
            fill=(*skin_mid_rgb, 120),
        )

        # Eyebrows & Eyes
        eye_y = 326 + (i % 3) * 3
        eye_col = hex_to_rgb(eye_colors[i % len(eye_colors)])
        hair_rgb = hex_to_rgb(hair_colors[i % len(hair_colors)])

        for side in (-1, 1):
            ex = cx + side * 52
            # Eye sclera
            d.polygon(
                [
                    (ex - 24, eye_y),
                    (ex - 10, eye_y - 11),
                    (ex + 12, eye_y - 11),
                    (ex + 24, eye_y),
                    (ex + 12, eye_y + 10),
                    (ex - 10, eye_y + 10),
                ],
                fill=(244, 247, 250, 255),
            )
            # Iris & Pupil
            d.ellipse((ex - 11, eye_y - 10, ex + 11, eye_y + 10), fill=(*eye_col, 255))
            d.ellipse((ex - 5, eye_y - 5, ex + 5, eye_y + 5), fill=(15, 20, 28, 255))
            # Specular catchlight
            d.ellipse((ex - 7, eye_y - 7, ex - 2, eye_y - 2), fill=(255, 255, 255, 235))
            # Upper eyelid & eyebrow
            d.line(
                [(ex - 25, eye_y - 2), (ex - 10, eye_y - 12), (ex + 13, eye_y - 12), (ex + 25, eye_y - 2)],
                fill=(28, 24, 24, 255),
                width=4,
            )
            brow_tilt = (i % 3 - 1) * 3 * side
            d.polygon(
                [
                    (ex - 28, eye_y - 22 - brow_tilt),
                    (ex + 28, eye_y - 25 + brow_tilt),
                    (ex + 26, eye_y - 16 + brow_tilt),
                    (ex - 26, eye_y - 14 - brow_tilt),
                ],
                fill=(*hair_rgb, 255),
            )

        # Nose bridge & tip shading
        d.polygon(
            [(cx - 4, eye_y + 4), (cx + 10, eye_y + 56), (cx - 14, eye_y + 62)],
            fill=(*skin_mid_rgb, 185),
        )
        d.polygon(
            [(cx - 18, eye_y + 58), (cx + 18, eye_y + 58), (cx + 8, eye_y + 68), (cx - 8, eye_y + 68)],
            fill=(*skin_sh_rgb, 210),
        )

        # Mouth / Expression (confident subtle smile or focused line)
        mouth_y = 432
        if i % 2 == 0:
            d.polygon(
                [
                    (cx - 34, mouth_y - 2),
                    (cx, mouth_y + 4),
                    (cx + 34, mouth_y - 2),
                    (cx + 24, mouth_y + 12),
                    (cx - 24, mouth_y + 12),
                ],
                fill=(*skin_sh_rgb, 235),
            )
            d.line([(cx - 24, mouth_y + 2), (cx + 24, mouth_y + 2)], fill=(242, 245, 248, 215), width=4)
        else:
            d.polygon(
                [
                    (cx - 32, mouth_y),
                    (cx, mouth_y - 3),
                    (cx + 32, mouth_y),
                    (cx + 22, mouth_y + 9),
                    (cx - 22, mouth_y + 9),
                ],
                fill=(*skin_sh_rgb, 240),
            )

        # Hairstyles / Racing Cap variations so all 43 pilots look distinct
        style_mode = i % 6
        if style_mode == 0:
            # Team Paddock Racing Cap with curved visor
            d.chord((cx - 130, 155, cx + 130, 325), 180, 360, fill=(*suit_rgb, 255))
            d.polygon(
                [(cx - 132, 240), (cx + 132, 240), (cx + 145, 265), (cx - 145, 265)],
                fill=(*dark_suit, 255),
            )
            d.line([(cx - 136, 262), (cx, 248), (cx + 136, 262)], fill=(*acc_rgb, 255), width=6)
        elif style_mode == 1:
            # Swept side-part hair
            d.chord((cx - 132, 152, cx + 132, 330), 175, 365, fill=(*hair_rgb, 255))
            d.polygon(
                [(cx - 128, 225), (cx + 35, 195), (cx + 126, 248), (cx + 115, 290), (cx + 95, 235), (cx - 115, 268)],
                fill=(*hair_rgb, 255),
            )
        elif style_mode == 2:
            # Textured high volume / curly top hair
            d.ellipse((cx - 132, 142, cx + 132, 285), fill=(*hair_rgb, 255))
            for k in range(-3, 4):
                d.ellipse((cx + k * 32 - 28, 136 + abs(k) * 5, cx + k * 32 + 28, 212 + abs(k) * 5), fill=(*hair_rgb, 255))
            d.rectangle((cx - 128, 220, cx - 108, 315), fill=(*hair_rgb, 255))
            d.rectangle((cx + 108, 220, cx + 128, 315), fill=(*hair_rgb, 255))
        elif style_mode == 3:
            # Long / shoulder-length racing hair tucked into suit collar
            d.polygon(
                [(cx - 138, 220), (cx - 154, 495), (cx - 95, 515), (cx - 108, 260)],
                fill=(*hair_rgb, 255),
            )
            d.polygon(
                [(cx + 138, 220), (cx + 154, 495), (cx + 95, 515), (cx + 108, 260)],
                fill=(*hair_rgb, 255),
            )
            d.chord((cx - 132, 154, cx + 132, 320), 180, 360, fill=(*hair_rgb, 255))
        elif style_mode == 4:
            # Short buzz / fade cut with sharp hairline
            d.chord((cx - 127, 162, cx + 127, 312), 180, 360, fill=(*hair_rgb, 255))
            d.polygon(
                [(cx - 124, 235), (cx - 92, 214), (cx + 92, 214), (cx + 124, 235), (cx + 116, 285), (cx + 105, 235), (cx - 105, 235), (cx - 116, 285)],
                fill=(*hair_rgb, 255),
            )
        else:
            # Wavy medium flow hair
            d.chord((cx - 135, 148, cx + 135, 328), 170, 370, fill=(*hair_rgb, 255))
            d.polygon(
                [(cx - 134, 230), (cx - 140, 355), (cx - 112, 340), (cx - 112, 240)],
                fill=(*hair_rgb, 255),
            )
            d.polygon(
                [(cx + 134, 230), (cx + 140, 355), (cx + 112, 340), (cx + 112, 240)],
                fill=(*hair_rgb, 255),
            )

        if i >= 31:
            # Golden Icon Laurel / Halo Trim on collar & background for Hall of Fame Icons
            d.arc((cx - 185, 125, cx + 185, 495), 200, 340, fill=(250, 204, 21, 180), width=6)

    # 4. Corner Broadcast Number & Team Accent Tag
    d.polygon([(0, H - 116), (178, H - 116), (154, H), (0, H)], fill=(12, 18, 28, 235))
    d.polygon([(0, H - 116), (178, H - 116), (174, H - 108), (0, H - 108)], fill=(*suit_rgb, 255))
    num_str = "#" + str(pilot["number"]).zfill(2)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
    except Exception:
        font = ImageFont.load_default()
    d.text((22, H - 92), num_str, fill=(248, 250, 252, 255), font=font)

    return im.resize((384, 432), Image.Resampling.LANCZOS)


def draw_helmet_icon(pilot):
    i = pilot["id"]
    S = 512
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im, "RGBA")

    suit_rgb = hex_to_rgb(pilot.get("suitColor") or pilot["color"])
    helm_rgb = hex_to_rgb(pilot.get("helmetColor") or pilot["color"])
    visor_rgb = hex_to_rgb(pilot.get("visorColor") or ("#c8f78c" if i == 30 else "#38bdf8"))
    acc_rgb = hex_to_rgb("#d7eaa0" if i == 30 else accents[i % len(accents)])
    dark_shell = mix(helm_rgb, (15, 23, 36), 0.45)

    # Outer aerodynamic helmet shell + rear spoiler
    d.polygon(
        [
            (78, 355),
            (64, 235),
            (108, 122),
            (215, 68),
            (355, 76),
            (448, 152),
            (432, 235),
            (446, 342),
            (395, 422),
            (158, 432),
        ],
        fill=(*helm_rgb, 255),
    )
    # Rear aero spoiler fin
    d.polygon(
        [(68, 185), (38, 155), (96, 128), (118, 195)],
        fill=(*suit_rgb, 255),
    )
    # Lower chin bar & carbon base skirt
    d.polygon(
        [(142, 368), (432, 336), (402, 422), (156, 432)],
        fill=(*dark_shell, 255),
    )
    d.polygon(
        [(152, 408), (405, 398), (392, 432), (162, 436)],
        fill=(22, 29, 40, 255),
    )
    # Livery racing stripe across crown & side
    d.polygon(
        [(82, 268), (225, 118), (325, 112), (168, 325)],
        fill=(*acc_rgb, 255),
    )
    d.polygon(
        [(118, 315), (275, 155), (332, 162), (185, 348)],
        fill=(*suit_rgb, 255),
    )
    # Visor housing & multi-layer tinted visor with specular reflection
    d.polygon(
        [(235, 188), (442, 178), (454, 282), (242, 302)],
        fill=(15, 22, 32, 255),
    )
    d.polygon(
        [(248, 200), (438, 192), (446, 268), (254, 286)],
        fill=(*visor_rgb, 255),
    )
    # Top Zylon visor strip
    d.polygon(
        [(246, 192), (438, 184), (440, 205), (248, 213)],
        fill=(241, 245, 249, 255),
    )
    # Visor highlight streak
    d.polygon(
        [(280, 212), (355, 208), (330, 272), (265, 276)],
        fill=(255, 255, 255, 115),
    )
    # HANS post anchor
    d.ellipse((158, 355, 192, 389), fill=(226, 232, 240, 255), outline=(30, 41, 59, 255), width=4)

    return im.resize((256, 256), Image.Resampling.LANCZOS)


def draw_placeholder_portrait():
    W, H = 768, 864
    im = Image.new("RGB", (W, H), (12, 18, 28))
    d = ImageDraw.Draw(im, "RGBA")
    for y in range(H):
        t = y / H
        bg = mix((22, 32, 48), (10, 15, 24), t)
        d.line((0, y, W, y), fill=(*bg, 255))
    cx = W // 2
    d.ellipse((cx - 240, 180, cx + 240, 660), outline=(56, 189, 248, 55), width=4)
    # Elegant silhouette of racing driver in helmet
    d.polygon(
        [
            (cx - 255, H),
            (cx - 228, 635),
            (cx - 105, 560),
            (cx + 105, 560),
            (cx + 228, 635),
            (cx + 255, H),
        ],
        fill=(30, 41, 59, 255),
        outline=(71, 85, 105, 255),
        width=4,
    )
    d.ellipse((cx - 138, 185, cx + 138, 495), fill=(38, 52, 74, 255), outline=(100, 116, 139, 255), width=5)
    d.polygon(
        [(cx - 112, 300), (cx + 112, 300), (cx + 122, 376), (cx - 122, 376)],
        fill=(15, 23, 42, 255),
        outline=(56, 189, 248, 180),
        width=3,
    )
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    except Exception:
        font = ImageFont.load_default()
    d.text((cx - 135, H - 72), "RETRATO SUBSTITUTO", fill=(148, 163, 184, 230), font=font)
    return im.resize((384, 432), Image.Resampling.LANCZOS)


for pilot in pilots:
    i = pilot["id"]
    out = "public/assets/drivers/" + pilot["tier"]
    os.makedirs(out, exist_ok=True)
    portrait_im = draw_driver_portrait(pilot)
    portrait_im.save(out + "/driver-" + str(i).zfill(2) + ".png", optimize=True)
    helmet_im = draw_helmet_icon(pilot)
    helmet_im.save(out + "/helmet-" + str(i).zfill(2) + ".png", optimize=True)

placeholder = draw_placeholder_portrait()
placeholder.save("public/assets/drivers/placeholder-driver.png", optimize=True)

print(f"{len(pilots)} retratos 2D HD + {len(pilots)} capacetes 2D RGBA + 1 placeholder gerados com sucesso.")
