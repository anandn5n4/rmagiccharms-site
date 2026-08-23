"""
R Magic Charms - local preview server.

Serves the site exactly as Cloudflare Pages does, so what you see here is what
visitors get. Run with:  python proxy_server.py [port]
"""
import http.server
import os
import socketserver
import sys


class RMagicHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Always re-read local edits instead of serving a stale copy.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

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