"""R Magic Charms — media build pipeline.

Everything the website displays is generated from `media-src/` by this script.
`media-src/` is your working area and is never deployed; `resources/` is the
generated, committed output that the site actually loads.

    media-src/
      photos/<album-slug>/*.jpg      one folder per shoot -> one gallery
      photos/<album-slug>/album.json optional title/date/location/captions
      site/<group>/*.jpg             non-album imagery (offerings, about, brand)
      video/*.mp4                    copied through untouched

    resources/
      photos/<album-slug>/<name>-<width>.webp
      site/<group>/<name>-<width>.webp
      media.json                     the manifest the site reads

Run it with `media.bat` (or `python tools/build_media.py`) after adding photos.
"""
from __future__ import annotations

import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "media-src"
OUT = ROOT / "resources"
MANIFEST = OUT / "media.json"
MEDIA_JS = ROOT / "media.js"

# Widths we publish. A phone picks 400/900 instead of pulling the desktop file.
WIDTHS = [400, 900, 1600]
QUALITY = 82
RASTER = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}
VIDEO = {".mp4", ".webm", ".mov", ".m4v"}

Image.MAX_IMAGE_PIXELS = None


def slug_to_words(value: str) -> str:
    return re.sub(r"[-_]+", " ", value).strip().title()


def photo_id(path: Path) -> str:
    return re.sub(r"[^a-z0-9]+", "-", path.stem.lower()).strip("-")


def average_tint(im: Image.Image) -> str:
    """A single averaged colour, used as the tile background before load."""
    small = im.convert("RGB").resize((1, 1), Image.LANCZOS)
    r, g, b = small.getpixel((0, 0))
    return f"#{r:02x}{g:02x}{b:02x}"


def derive(src: Path, rel_dir: str) -> dict | None:
    """Write every published width for one source image and describe it."""
    with Image.open(src) as im:
        im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
        width, height = im.size
        tint = average_tint(im)

        name = photo_id(src)
        dest_dir = OUT / rel_dir
        dest_dir.mkdir(parents=True, exist_ok=True)

        # Never upscale: publish only widths the source can actually fill, and
        # always publish at least one file even for small assets like the logo.
        widths = [w for w in WIDTHS if w <= width] or [min(width, WIDTHS[0])]
        if width < WIDTHS[-1] and width not in widths:
            widths.append(width)

        for w in sorted(set(widths)):
            scaled = im if w == width else im.resize(
                (w, max(1, round(height * w / width))), Image.LANCZOS
            )
            scaled.save(dest_dir / f"{name}-{w}.webp", "WEBP",
                        quality=QUALITY, method=6)

    return {
        "id": name,
        "base": f"resources/{rel_dir}/{name}",
        "widths": sorted(set(widths)),
        "w": width,
        "h": height,
        "ratio": round(width / height, 4),
        "tint": tint,
    }


def build_group(folder: Path, rel_dir: str, captions: dict) -> list[dict]:
    photos = []
    for src in sorted(folder.iterdir()):
        if not src.is_file() or src.suffix.lower() not in RASTER:
            continue
        entry = derive(src, rel_dir)
        meta = captions.get(src.name) or captions.get(entry["id"]) or {}
        if isinstance(meta, str):
            meta = {"alt": meta}
        entry["alt"] = meta.get("alt") or slug_to_words(entry["id"])
        if meta.get("caption"):
            entry["caption"] = meta["caption"]
        photos.append(entry)
    return photos


def build_albums() -> tuple[list[dict], dict[str, dict]]:
    albums, index = [], {}
    root = SRC / "photos"
    if not root.exists():
        return albums, index

    folders = sorted(p for p in root.iterdir() if p.is_dir())
    configs, folder_photos = {}, {}

    # Pass one: publish every photo and index it, so an album can curate images
    # that physically live in another folder regardless of folder order.
    for folder in folders:
        config_path = folder / "album.json"
        configs[folder] = json.loads(config_path.read_text("utf-8")) if config_path.exists() else {}
        photos = build_group(folder, f"photos/{folder.name}", configs[folder].get("captions", {}))
        folder_photos[folder] = photos
        for photo in photos:
            index[f"{folder.name}/{photo['id']}"] = photo

    # Pass two: assemble the albums themselves.
    for folder in folders:
        config = configs[folder]
        photos = folder_photos[folder]

        # An album may curate an explicit order, including photos referenced as
        # "<album-slug>/<photo-id>" from another folder.
        if config.get("photos"):
            chosen = []
            for ref in config["photos"]:
                key = ref if "/" in ref else f"{folder.name}/{ref}"
                if key in index:
                    chosen.append(index[key])
                else:
                    print(f"  ! {folder.name}: unknown photo reference '{ref}'")
            photos = chosen or photos

        if not photos:
            continue

        cover_ref = config.get("cover")
        cover = index.get(cover_ref) if cover_ref and "/" in cover_ref else None
        if cover is None:
            cover = next((p for p in photos if p["id"] == cover_ref), photos[0])

        albums.append({
            "slug": config.get("slug", folder.name),
            "title": config.get("title", slug_to_words(folder.name)),
            "ceremony": config.get("ceremony", "Wedding"),
            "filter": config.get("filter", "all"),
            "location": config.get("location", ""),
            "date": config.get("date", ""),
            "year": config.get("year") or (config.get("date", "")[:4]),
            "quote": config.get("quote", ""),
            "quoteAuthor": config.get("quoteAuthor", ""),
            "story": config.get("story", ""),
            "listed": config.get("listed", True),
            "featured": config.get("featured", False),
            "cover": cover,
            "photos": photos,
        })

    albums.sort(key=lambda a: (a.get("date") or "", a["title"]), reverse=True)
    return albums, index


def build_site() -> dict[str, list[dict]]:
    groups: dict[str, list[dict]] = {}
    root = SRC / "site"
    if not root.exists():
        return groups

    for folder in sorted(p for p in root.iterdir() if p.is_dir()):
        config_path = folder / "captions.json"
        captions = json.loads(config_path.read_text("utf-8")) if config_path.exists() else {}
        photos = build_group(folder, f"site/{folder.name}", captions)
        if photos:
            groups[folder.name] = photos
    return groups


def build_video() -> dict[str, str]:
    videos = {}
    root = SRC / "video"
    if not root.exists():
        return videos
    dest_dir = OUT / "video"
    dest_dir.mkdir(parents=True, exist_ok=True)
    for src in sorted(root.iterdir()):
        if src.is_file() and src.suffix.lower() in VIDEO:
            dest = dest_dir / src.name
            # Copied byte-for-byte; video is never re-encoded by this pipeline.
            if not dest.exists() or dest.stat().st_size != src.stat().st_size:
                shutil.copy2(src, dest)
            videos[photo_id(src)] = f"resources/video/{src.name}"
    return videos


def sync_index_html(hero_poster: dict | None) -> None:
    """Keep index.html's hero preload pointing at a file that really exists.

    The hero poster is the one image the browser should fetch before JS has even
    run, so it is named directly in the HTML. Regenerating it here means
    swapping the poster never leaves a dangling preload behind.
    """
    if not hero_poster:
        return
    page = ROOT / "index.html"
    if not page.exists():
        return
    widest = hero_poster["widths"][-1]
    href = f"{hero_poster['base']}-{widest}.webp"
    text = page.read_text("utf-8")
    updated = re.sub(
        r'(<link rel="preload" as="image" href=")[^"]*(")',
        lambda m: m.group(1) + href + m.group(2),
        text,
    )
    if updated != text:
        page.write_text(updated, "utf-8")
        print(f"  index.html hero preload -> {href}")


def main() -> int:
    if not SRC.exists():
        print(f"No media-src/ folder found at {SRC}")
        return 1

    # Regenerate from scratch so deleted sources never linger in the output.
    for stale in ("photos", "site"):
        shutil.rmtree(OUT / stale, ignore_errors=True)

    albums, index = build_albums()
    site = build_site()
    videos = build_video()

    settings_path = SRC / "site.json"
    settings = json.loads(settings_path.read_text("utf-8")) if settings_path.exists() else {}
    hero_poster = index.get(settings.get("heroPoster", ""))
    if hero_poster is None and index:
        hero_poster = next(iter(index.values()))

    manifest = {
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "widths": WIDTHS,
        "heroPoster": hero_poster,
        "albums": albums,
        "site": site,
        "video": videos,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2), "utf-8")
    # Also emit the manifest as a plain script. The site is client-rendered, so
    # loading it as <script> keeps it in the same parallel fetch as app.js
    # instead of costing an extra round trip after JS boots.
    MEDIA_JS.write_text(
        "// Generated by tools/build_media.py — do not edit by hand.\n"
        "window.RMAGIC_MEDIA = " + json.dumps(manifest, separators=(",", ":")) + ";\n",
        "utf-8",
    )

    total = sum(f.stat().st_size for f in OUT.rglob("*.webp"))
    photo_count = sum(len(a["photos"]) for a in albums)
    sync_index_html(hero_poster)

    for album in albums:
        flag = "featured" if album["featured"] else ""
        print(f"  album  {album['slug']:<34} {len(album['photos']):>3} photos  {flag}")
    for group, photos in site.items():
        print(f"  site   {group:<34} {len(photos):>3} images")
    for name in videos:
        print(f"  video  {name}")
    print(f"\n{photo_count} album photos · {len(site)} site groups · "
          f"{total/1024/1024:.2f} MB of WebP written to resources/")
    print(f"Manifest: {MANIFEST.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
