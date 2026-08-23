"""
R Magic Charms — local server with automatic image discovery.
Run with: python proxy_server.py
"""
import http.server
import json
import os
import re
import socketserver
import urllib.parse
IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp", ".avif")
IMAGE_SECTIONS = {"home", "about", "portfolio"}


class RMagicHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/images"):
            self._list_uploaded_images()
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
