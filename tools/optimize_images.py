"""One-off asset optimizer: resize + convert site images to WebP.

Originals are copied to resources/_originals/ (git-ignored) before anything is
rewritten, so this is always reversible.
"""
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RES = ROOT / "resources"
BACKUP = RES / "_originals"
MAX_EDGE = 1600
QUALITY = 82
EXTS = {".jpg", ".jpeg", ".png"}

Image.MAX_IMAGE_PIXELS = None


def main():
    targets = [
        p for p in RES.rglob("*")
        if p.is_file() and p.suffix.lower() in EXTS and BACKUP not in p.parents
    ]
    before = after = 0
    rows = []

    for src in sorted(targets):
        rel = src.relative_to(RES)
        backup = BACKUP / rel
        backup.parent.mkdir(parents=True, exist_ok=True)
        if not backup.exists():
            shutil.copy2(src, backup)

        with Image.open(src) as im:
            im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
            w, h = im.size
            scale = min(1.0, MAX_EDGE / max(w, h))
            if scale < 1.0:
                im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
            dest = src.with_suffix(".webp")
            im.save(dest, "WEBP", quality=QUALITY, method=6)
            final_size = im.size

        old, new = src.stat().st_size, dest.stat().st_size
        before += old
        after += new
        rows.append((rel.as_posix(), old, new, final_size))
        if dest != src:
            src.unlink()

    for rel, old, new, size in rows:
        print(f"{old/1024:8.0f}K -> {new/1024:7.0f}K  {size[0]}x{size[1]}  {rel}")
    print(f"\nTOTAL {before/1024/1024:.2f} MB -> {after/1024/1024:.2f} MB "
          f"({100 - after / before * 100:.0f}% smaller)")


if __name__ == "__main__":
    sys.exit(main())
