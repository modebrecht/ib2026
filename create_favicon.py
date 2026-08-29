import os
from PIL import Image, ImageDraw, ImageFont

SIZE = 256
CORNER_RADIUS = 50
COLOR_1 = (37, 99, 235)   # #2563eb
COLOR_2 = (29, 78, 216)   # #1d4ed8


def load_font():
    size = int(SIZE * 0.55)
    candidates = [
        "segoeuib.ttf",
        "arialbd.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            pass
    return ImageFont.load_default()


def create_favicon(text, output_dir="."):
    os.makedirs(output_dir, exist_ok=True)

    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 135deg blue gradient, matching the existing IB favicon.
    for y in range(SIZE):
        for x in range(SIZE):
            t = (x + y) / (2 * SIZE)
            r = int(COLOR_1[0] + (COLOR_2[0] - COLOR_1[0]) * t)
            g = int(COLOR_1[1] + (COLOR_2[1] - COLOR_1[1]) * t)
            b = int(COLOR_1[2] + (COLOR_2[2] - COLOR_1[2]) * t)
            draw.point((x, y), fill=(r, g, b, 255))

    mask = Image.new("L", (SIZE, SIZE), 0)
    mask_draw = ImageDraw.Draw(mask)
    try:
        mask_draw.rounded_rectangle((0, 0, SIZE, SIZE), radius=CORNER_RADIUS, fill=255)
    except AttributeError:
        mask_draw.rectangle((CORNER_RADIUS, 0, SIZE - CORNER_RADIUS, SIZE), fill=255)
        mask_draw.rectangle((0, CORNER_RADIUS, SIZE, SIZE - CORNER_RADIUS), fill=255)
        mask_draw.pieslice((0, 0, CORNER_RADIUS * 2, CORNER_RADIUS * 2), 180, 270, fill=255)
        mask_draw.pieslice((SIZE - CORNER_RADIUS * 2, 0, SIZE, CORNER_RADIUS * 2), 270, 360, fill=255)
        mask_draw.pieslice((0, SIZE - CORNER_RADIUS * 2, CORNER_RADIUS * 2, SIZE), 90, 180, fill=255)
        mask_draw.pieslice((SIZE - CORNER_RADIUS * 2, SIZE - CORNER_RADIUS * 2, SIZE, SIZE), 0, 90, fill=255)

    img.putalpha(mask)

    font = load_font()
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        text_x = (SIZE - text_w) / 2 - bbox[0]
        text_y = (SIZE - text_h) / 2 - bbox[1]
    except AttributeError:
        text_w, text_h = draw.textsize(text, font=font)
        text_x = (SIZE - text_w) / 2
        text_y = (SIZE - text_h) / 2 - int(SIZE * 0.05)

    draw.text((text_x, text_y), text, font=font, fill=(255, 255, 255, 255))

    png_path = os.path.join(output_dir, "favicon.png")
    ico_path = os.path.join(output_dir, "favicon.ico")
    img.save(png_path)
    img.save(ico_path, sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])
    print(f"Generated {text} favicon -> {output_dir}")


if __name__ == "__main__":
    create_favicon("IB")
    create_favicon("HW", "hw")
    create_favicon("TK", "tk2")
