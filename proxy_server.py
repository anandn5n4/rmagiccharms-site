"""
R Magic Charms - local preview server.

Serves the site exactly as Cloudflare Pages does, so what you see here is what
visitors get. Run with:  python proxy_server.py [port]
"""
import http.server
import os
import socketserver
import sys
import urllib.error
import urllib.parse
import urllib.request

# Mirrors the host allow-list in functions/api/instagram-media.js so the local
# preview reaches Instagram the same way the deployed site does.
ALLOWED_HOSTS = ("imginn.com", "cdninstagram.com", "fbcdn.net")


def allowed(source):
    parts = urllib.parse.urlparse(source)
    if parts.scheme != "https":
        return False
    return any(parts.hostname == h or (parts.hostname or "").endswith("." + h)
               for h in ALLOWED_HOSTS)


class RMagicHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Always re-read local edits instead of serving a stale copy.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/instagram-media":
            return self.instagram_media()
        if path == "/api/instagram":
            # No Graph API token locally, exactly as on an unconfigured deploy.
            body = b'{"posts":[],"source":"unconfigured"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return None
        return super().do_GET()

    def instagram_media(self):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        source = (query.get("url") or [""])[0]
        if not source or not allowed(source):
            self.send_error(400, "Invalid media URL")
            return
        request = urllib.request.Request(source, headers={
            "Accept": self.headers.get("Accept", "*/*"),
            "Referer": "https://www.instagram.com/",
            "User-Agent": "Mozilla/5.0 (compatible; RMagicCharms/1.0)",
        })
        range_header = self.headers.get("Range")
        if range_header:
            request.add_header("Range", range_header)
        try:
            with urllib.request.urlopen(request, timeout=30) as upstream:
                payload = upstream.read()
                content_type = upstream.headers.get("Content-Type", "application/octet-stream")
                content_range = upstream.headers.get("Content-Range")
                status = upstream.status
        except (urllib.error.URLError, OSError) as error:
            self.send_error(502, "Instagram media unavailable: %s" % error)
            return
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        if content_range:
            self.send_header("Content-Range", content_range)
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, fmt, *args):
        pass  # quiet mode


class RMagicServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with RMagicServer(("", port), RMagicHandler) as httpd:
        print("R Magic Charms running at http://localhost:" + str(port))
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")