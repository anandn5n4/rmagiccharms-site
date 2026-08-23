"""
R Magic Charms - Instagram snapshot.

The site used to read Instagram's public mirror while a visitor waited. That
mirror answers differently depending on which region asks, so the wall filled
in for some people and fell back to studio photographs for others. The feed is
captured here instead, on a schedule, and committed as a plain file the site
can always read.

Run with:  python tools/snapshot_instagram.py
"""
import json
import os
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request

HANDLE = "r_magic_charms"
UID = "70367859285"
FEED = "https://imginn.com/api/posts/"
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "resources" / "instagram.json"
THUMBS = ROOT / "resources" / "instagram"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")


def get(url, referer="https://imginn.com/"):
    request = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": referer,
    })
    return urllib.request.urlopen(request, timeout=45).read()


def count(value):
    """Likes arrive either as a number or as text such as "6k"."""
    if isinstance(value, (int, float)):
        return int(value) if value >= 0 else None
    text = str(value or "").strip().lower()
    try:
        if text.endswith("k"):
            return int(float(text[:-1]) * 1_000)
        if text.endswith("m"):
            return int(float(text[:-1]) * 1_000_000)
        number = int(float(text))
        return number if number >= 0 else None
    except ValueError:
        return None


def clean(alt, is_video):
    words = [w for w in str(alt or "").split() if not w.startswith(("#", "@"))]
    text = " ".join(words).strip()[:140]
    return text or ("Reel by R Magic Charms" if is_video else "Photograph by R Magic Charms")


def fetch_pages():
    posts, cursor, seen = [], "", set()
    for page in range(12):
        url = f"{FEED}?id={UID}&cursor={urllib.parse.quote(cursor)}"
        payload = json.loads(get(url, f"https://imginn.com/{HANDLE}/"))
        items = payload.get("items") or []
        for item in items:
            if (item.get("owner") or {}).get("username") != HANDLE:
                continue
            code = item.get("code")
            if not code or code in seen or not item.get("thumb"):
                continue
            seen.add(code)
            posts.append(item)
        print(f"  page {page + 1}: {len(items)} items, {len(posts)} kept")
        cursor = payload.get("cursor") or ""
        if not payload.get("hasNext") or not cursor:
            break
    return posts


def main():
    print("Reading the public feed...")
    try:
        raw = fetch_pages()
    except urllib.error.HTTPError as error:
        print(f"Instagram mirror refused this runner: HTTP {error.code}", file=sys.stderr)
        return 1
    if not raw:
        print("The feed returned nothing for this account.", file=sys.stderr)
        return 1

    THUMBS.mkdir(parents=True, exist_ok=True)
    kept, hosts = [], {}
    for item in raw:
        code = item["code"]
        is_video = bool(item.get("isVideo"))
        name = f"{code}.jpg"
        target = THUMBS / name
        # The poster frame is small and is stored with the site, so a visitor
        # never waits on a third party to see the wall.
        if not target.exists():
            try:
                target.write_bytes(get(item["thumb"]))
            except Exception as error:
                print(f"  thumb failed for {code}: {error}", file=sys.stderr)
                continue
        source = item.get("src") or ""
        if source:
            hosts[urllib.parse.urlparse(source).hostname] = hosts.get(
                urllib.parse.urlparse(source).hostname, 0) + 1
        kept.append({
            "id": code,
            "isVideo": is_video,
            "poster": f"resources/instagram/{name}",
            "media": source,
            "alt": clean(item.get("alt"), is_video),
            "likeCount": count(item.get("likeCount")),
            "permalink": f"https://www.instagram.com/{'reel' if is_video else 'p'}/{code}/",
        })

    OUT.write_text(json.dumps({
        "handle": HANDLE,
        "posts": kept,
    }, indent=2), encoding="utf-8")

    reels = sum(1 for p in kept if p["isVideo"])
    print(f"Saved {len(kept)} posts ({reels} reels) to {OUT.relative_to(ROOT)}")
    print("Video hosts:", ", ".join(f"{h} x{n}" for h, n in hosts.items()) or "none")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
