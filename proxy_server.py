"""
R Magic Charms — local server with Instagram proxy and video range support.
Run with: python proxy_server.py
"""
import html
import http.server
import json
import os
import re
import socketserver
import urllib.parse
import urllib.request

INSTA_UID = "70367859285"  # @r_magic_charms user ID
VIDEO_EXTS = (".mp4", ".webm", ".ogv", ".mov")
IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp", ".avif")
IMAGE_SECTIONS = {"home", "about", "portfolio"}


class RMagicHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/images"):
            self._list_uploaded_images()
        elif self.path.startswith("/api/videos"):
            self._list_uploaded_videos()
        elif self.path.startswith("/api/profile"):
            self._proxy_profile()
        elif self.path.startswith("/api/insta"):
            self._proxy_insta()
        elif self.path.startswith("/api/media"):
            self._proxy_media()
        elif self.path.startswith("/api/img"):
            self._proxy_img()
        else:
            # Handle range requests for videos (enables seeking)
            local_path = self.translate_path(self.path.split("?")[0])
            if local_path.lower().endswith(VIDEO_EXTS) and os.path.isfile(local_path):
                self._serve_video(local_path)
            else:
                super().do_GET()

    def _list_uploaded_images(self):
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        section = params.get("section", [""])[0].lower()
        if section not in IMAGE_SECTIONS:
            self.send_error(400, "Unknown image section")
            return
        image_dir = os.path.join(os.getcwd(), "resources", "uploads", section)
        os.makedirs(image_dir, exist_ok=True)
        metadata_path = os.path.join(image_dir, "metadata.json")
        metadata = {}
        if os.path.isfile(metadata_path):
            try:
                with open(metadata_path, "r", encoding="utf-8") as handle:
                    metadata = json.load(handle)
            except (OSError, ValueError):
                metadata = {}
        images = []
        for name in os.listdir(image_dir):
            path = os.path.join(image_dir, name)
            if not os.path.isfile(path) or not name.lower().endswith(IMAGE_EXTS):
                continue
            details = metadata.get(name, {})
            title = os.path.splitext(name)[0].replace("_", " ").replace("-", " ")
            title = re.sub(r"\s+", " ", title).strip().title()
            images.append({
                "src": "/resources/uploads/" + section + "/" + urllib.parse.quote(name),
                "title": details.get("title", title),
                "alt": details.get("alt", details.get("title", title)),
                "credit": details.get("credit", ""),
                "creditUrl": details.get("creditUrl", ""),
                "modified": int(os.path.getmtime(path)),
            })
        images.sort(key=lambda item: item["modified"], reverse=True)
        payload = json.dumps({"section": section, "images": images}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def _list_uploaded_videos(self):
        video_dir = os.path.join(os.getcwd(), "resources", "videos")
        os.makedirs(video_dir, exist_ok=True)
        videos = []
        for name in sorted(os.listdir(video_dir), key=str.lower):
            path = os.path.join(video_dir, name)
            if not os.path.isfile(path) or not name.lower().endswith(VIDEO_EXTS):
                continue
            title = os.path.splitext(name)[0].replace("_", " ").replace("-", " ")
            title = re.sub(r"\s+", " ", title).strip().title()
            videos.append({
                "src": "/resources/videos/" + urllib.parse.quote(name),
                "title": title,
                "subtitle": "NEWLY ADDED FILM",
                "type": "WEDDING FILM",
                "year": "",
                "size": "feature",
                "bytes": os.path.getsize(path),
            })
        payload = json.dumps({"videos": videos}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def _serve_video(self, path):
        try:
            file_size = os.path.getsize(path)
        except OSError:
            self.send_error(404)
            return

        range_header = self.headers.get("Range", "")
        match = re.match(r"bytes=(\d*)-(\d*)", range_header)
        if match:
            s, e = match.groups()
            start = int(s) if s else 0
            end = int(e) if e else file_size - 1
            end = min(end, file_size - 1)
            chunk = end - start + 1
            try:
                with open(path, "rb") as f:
                    f.seek(start)
                    data = f.read(chunk)
                self.send_response(206)
                self.send_header("Content-Type", "video/mp4")
                self.send_header("Content-Length", str(chunk))
                self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, file_size))
                self.send_header("Accept-Ranges", "bytes")
                self.end_headers()
                self.wfile.write(data)
            except Exception:
                self.send_error(500)
        else:
            # Full file — stream in 512KB chunks
            try:
                self.send_response(200)
                self.send_header("Content-Type", "video/mp4")
                self.send_header("Content-Length", str(file_size))
                self.send_header("Accept-Ranges", "bytes")
                self.end_headers()
                with open(path, "rb") as f:
                    while True:
                        chunk = f.read(524288)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
            except Exception:
                pass

    def _proxy_img(self):
        # Proxy imginn CDN images server-side to bypass hotlink protection
        # Cache images locally in .img_cache/ so repeat loads are instant
        import hashlib
        qs = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(qs)
        url = params.get("url", [None])[0]
        if not url or not self._allowed_media_url(url, images_only=True):
            self.send_response(400)
            self.end_headers()
            return
        # Check local cache first
        cache_dir = ".img_cache"
        os.makedirs(cache_dir, exist_ok=True)
        cache_key = hashlib.md5(url.encode()).hexdigest() + ".jpg"
        cache_path = os.path.join(cache_dir, cache_key)
        if os.path.exists(cache_path):
            with open(cache_path, "rb") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "image/jpeg")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "public, max-age=86400")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(data)
            return
        # Fetch from imginn CDN with proper referer
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://imginn.com/",
            "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        }
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as r:
                data = r.read()
                ctype = r.headers.get("Content-Type", "image/jpeg")
            # Save to cache
            with open(cache_path, "wb") as f:
                f.write(data)
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "public, max-age=86400")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(data)
        except Exception:
            self.send_response(502)
            self.end_headers()

    def _proxy_media(self):
        qs = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(qs)
        url = params.get("url", [None])[0]
        if not url or not self._allowed_media_url(url):
            self.send_error(400, "Unsupported media URL")
            return

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.instagram.com/",
            "Accept": "video/mp4,video/*;q=0.9,*/*;q=0.5",
        }
        range_header = self.headers.get("Range")
        if range_header:
            headers["Range"] = range_header

        try:
            request = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(request, timeout=20) as response:
                status = getattr(response, "status", 200)
                self.send_response(status)
                self.send_header("Content-Type", response.headers.get("Content-Type", "video/mp4"))
                for name in ("Content-Length", "Content-Range", "Accept-Ranges"):
                    value = response.headers.get(name)
                    if value:
                        self.send_header(name, value)
                self.send_header("Cache-Control", "private, max-age=300")
                self.end_headers()
                while True:
                    chunk = response.read(524288)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
        except (BrokenPipeError, ConnectionResetError):
            return
        except Exception as exc:
            self.send_error(502, "Instagram media unavailable: " + str(exc))

    def _proxy_profile(self):
        url = "https://imginn.com/r_magic_charms/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html",
        }
        try:
            request = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(request, timeout=10) as response:
                page = response.read().decode("utf-8", errors="replace")
            match = re.search(r'"image"\s*:\s*"([^"]+)"', page)
            if not match:
                raise ValueError("Profile image was not found")
            payload = json.dumps({
                "name": "R MAGIC CHARMS",
                "username": "r_magic_charms",
                "image": html.unescape(match.group(1)),
            }).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.send_header("Cache-Control", "public, max-age=3600")
            self.end_headers()
            self.wfile.write(payload)
        except Exception as exc:
            payload = json.dumps({"error": str(exc)}).encode()
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

    @staticmethod
    def _allowed_media_url(url, images_only=False):
        parsed = urllib.parse.urlparse(url)
        hostname = (parsed.hostname or "").lower()
        allowed = (
            hostname == "imginn.com"
            or hostname.endswith(".imginn.com")
            or hostname == "cdninstagram.com"
            or hostname.endswith(".cdninstagram.com")
        )
        if not allowed or parsed.scheme != "https":
            return False
        return not images_only or hostname == "imginn.com" or hostname.endswith(".imginn.com")

    def _proxy_insta(self):
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        cursor = params.get("cursor", [""])[0]
        url = "https://imginn.com/api/posts/?" + urllib.parse.urlencode({
            "id": INSTA_UID,
            "cursor": cursor,
        })
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
            "Referer": "https://imginn.com/",
        }
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as r:
                data = r.read()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            err = json.dumps({"error": str(e)}).encode()
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(err)

    def log_message(self, fmt, *args):
        pass  # quiet mode


class RMagicServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    port = 4173
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with RMagicServer(("", port), RMagicHandler) as httpd:
        print("R Magic Charms running at http://localhost:" + str(port))
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
