"""
生成 NSIS 安装向导的品牌图：
  sidebar.bmp 164×314  欢迎页/完成页左侧竖图
  header.bmp  150×57   中间页右上角横幅
配色与应用一致（teal #0f766e），图内不放中文字，避免语言切换后图文不一致。
"""
import json
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.abspath(os.path.join(ROOT, "..", "..", "sentrydesk"))
ICON = os.path.join(SRC, "src-tauri", "icons", "128x128.png")
OUT = os.path.join(SRC, "src-tauri", "installer")
FONTS = r"C:\Windows\Fonts"

ACCENT = (15, 118, 110)
MINT = (153, 246, 228)
WHITE = (255, 255, 255)

os.makedirs(OUT, exist_ok=True)

# 版本号从 tauri.conf.json 取，升版时侧栏图不会停留在旧数字
CONF = os.path.join(SRC, "src-tauri", "tauri.conf.json")
VERSION = "v" + json.load(open(CONF, encoding="utf-8"))["version"]


def font(name, size):
    p = os.path.join(FONTS, name)
    return ImageFont.truetype(p, size) if os.path.exists(p) else ImageFont.load_default()


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(w, h, c1, c2):
    """对角渐变：左上 c1 → 右下 c2"""
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        for_x = y / max(1, h - 1)
        d.line([(0, y), (w, y)], fill=lerp(c1, c2, for_x * 0.85))
    return img




def sidebar():
    W, H = 164, 314
    img = gradient(W, H, (19, 133, 124), (8, 70, 64)).convert("RGBA")

    # 右上角柔光：比硬边水印干净得多
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W - 70, -60, W + 110, 120], fill=(255, 255, 255, 34))
    glow = glow.filter(ImageFilter.GaussianBlur(28))
    img.alpha_composite(glow)

    d = ImageDraw.Draw(img)
    # 右边缘一道高光，把面板和白色内容区切开
    d.line([(W - 1, 0), (W - 1, H)], fill=(255, 255, 255, 26), width=1)

    # 图标：应用图标自带深色圆角底，直接压上去即可，再垫底会变成双层描边
    ico = Image.open(ICON).convert("RGBA").resize((52, 52), Image.LANCZOS)
    img.alpha_composite(ico, (20, 26))

    # 应用名
    d.text((20, 92), "SentryDesk", font=font("seguisb.ttf", 20), fill=WHITE)
    # 版本
    d.text((20, 120), VERSION, font=font("segoeui.ttf", 12), fill=MINT)

    # 分隔线
    d.line([(20, 148), (58, 148)], fill=(255, 255, 255, 90), width=2)

    # 底部标记：三个点 + 一行小字，保持克制
    d.text((20, 258), "local-first", font=font("segoeui.ttf", 11), fill=(196, 230, 224))
    for i in range(3):
        x = 20 + i * 11
        d.ellipse([x, 283, x + 5, 288], fill=(255, 255, 255, 110) if i else MINT)

    img.convert("RGB").save(os.path.join(OUT, "sidebar.bmp"), "BMP")
    img.convert("RGB").save(os.path.join(OUT, "sidebar-preview.png"), "PNG")
    print("sidebar", img.size)


def header():
    W, H = 150, 57
    # 纯白底：MUI 的页眉画在白底上，白底 BMP 才能无缝
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)

    # MUI 把页眉图右对齐贴边，所以内容要往右靠；宽度只有 150，字号必须收着用
    f = font("seguisb.ttf", 12)
    label = "SentryDesk"
    tw = int(d.textlength(label, font=f))
    right = W - 6
    tx = right - tw
    ty = (H - 15) // 2

    ico_size = 18
    ico = Image.open(ICON).convert("RGBA").resize((ico_size, ico_size), Image.LANCZOS)
    img.paste(ico, (tx - ico_size - 6, (H - ico_size) // 2), ico)

    d.text((tx, ty), label, font=f, fill=ACCENT)
    img.save(os.path.join(OUT, "header.bmp"), "BMP")
    img.save(os.path.join(OUT, "header-preview.png"), "PNG")
    print("header", img.size, "text-width", tw)


sidebar()
header()
print("->", OUT)
