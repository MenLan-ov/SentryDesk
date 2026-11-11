#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""打便携版 zip。

为什么不用资源管理器的「发送到 → 压缩文件夹」：
Windows 内置压缩会按 GBK 写文件名，解压后中文变乱码（曾产出 `õ¢+þö¿Þ»¦µÄ.txt`）。
Python 的 zipfile 会写 UTF-8 标志位（bit 11），Windows 10+ 与 7-Zip 都能正确还原。

用法（在项目根目录）：
    python _tools/pack/make_portable.py                # 版本号取自 src/version.ts
    python _tools/pack/make_portable.py --exe <path>   # 指定 exe（默认 release 构建）
"""
import argparse
import re
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_EXE = ROOT / "src-tauri" / "target" / "release" / "sentrydesk.exe"
OUT_DIR = ROOT / "src-tauri" / "target" / "release" / "bundle" / "nsis"


def read_version() -> str:
    m = re.search(r'APP_VERSION\s*=\s*"([^"]+)"', (ROOT / "src" / "version.ts").read_text(encoding="utf-8"))
    if not m:
        sys.exit("无法从 src/version.ts 读取版本号")
    return m.group(1)


def build(exe: Path, version: str) -> Path:
    if not exe.exists():
        sys.exit(f"找不到 exe：{exe}")
    name = f"SentryDesk_{version}_portable.zip"
    out = OUT_DIR / name
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        stage = Path(tmp) / "SentryDesk"
        stage.mkdir()
        shutil.copy2(exe, stage / "SentryDesk.exe")
        shutil.copytree(ROOT / "knowledge", stage / "knowledge")
        shutil.copy2(ROOT / "packaging" / "使用说明.txt", stage / "使用说明.txt")

        files = sorted(p for p in stage.rglob("*") if p.is_file())
        with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
            for p in files:
                # 相对路径用 / 分隔；zipfile 在文件名非 ASCII 时自动置 UTF-8 标志位
                z.write(p, p.relative_to(stage).as_posix())

        # 自检：任何一项名字解码不回来，说明标志位没写对
        with zipfile.ZipFile(out) as z:
            bad = [i.filename for i in z.infolist() if not (i.flag_bits & 0x800) and any(ord(c) > 127 for c in i.filename)]
            if bad:
                sys.exit(f"非 UTF-8 文件名：{bad}")
            names = z.namelist()

    size = out.stat().st_size
    print(f"已生成 {out}")
    print(f"  {len(names)} 个文件，{size:,} 字节（{size / 1024 / 1024:.2f} MB）")
    print(f"  含 knowledge/seed：{'knowledge/seed/kev.json' in names}")
    print(f"  中文名正常：{'使用说明.txt' in names}")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--exe", type=Path, default=DEFAULT_EXE)
    a = ap.parse_args()
    build(a.exe, read_version())


if __name__ == "__main__":
    main()
