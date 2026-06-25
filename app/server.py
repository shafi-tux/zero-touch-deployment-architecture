import json
import time
import os
import redis
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

START_TIME = time.time()
BASE_DIR = Path(__file__).resolve().parent

# Ask the OS for the REDIS_HOST variable. If it's missing, default to 'localhost'
redis_ip = os.environ.get('REDIS_HOST', 'localhost')
cache = redis.Redis(host=redis_ip, port=6379, db=0, decode_responses=True)

# MIME type mapping for static file serving
MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
}

class AppHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        real_ip = self.headers.get('X-Real-IP', 'Unknown / Bypassed Proxy')
        
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            try:
                with open(BASE_DIR / 'index.html', 'rb') as f:
                    self.wfile.write(f.read())
            except FileNotFoundError:
                self.wfile.write(b"<h1>Dashboard missing! Check file paths.</h1>")
                
        elif self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            uptime = round(time.time() - START_TIME)
            
            # Talk to Redis! Increment the counter by 1 every time this is called.
            visitor_count = "Error connecting to cache"
            try:
                visitor_count = cache.incr('visitor_count')
            except redis.ConnectionError:
                print("Warning: Redis cache is unreachable.", flush=True)

            data = {
                "status": "online",
                "uptime_seconds": uptime,
                "client_ip": real_ip,
                "server_time": time.strftime("%Y-%m-%d %H:%M:%S"),
                "visitor_count": visitor_count
            }
            self.wfile.write(json.dumps(data).encode('utf-8'))

        elif self.path in ('/style.css', '/script.js'):
            # Serve static CSS and JS files from the same directory
            file_path = BASE_DIR / self.path.lstrip('/')
            suffix = file_path.suffix
            mime = MIME_TYPES.get(suffix, 'application/octet-stream')
            try:
                self.send_response(200)
                self.send_header('Content-type', mime)
                self.end_headers()
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
            except FileNotFoundError:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"404 - Not Found")
            
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 - Not Found")

if __name__ == '__main__':
    # Binding to 0.0.0.0 is required for Docker bridge networking!
    server_address = ('0.0.0.0', 8000)
    httpd = HTTPServer(server_address, AppHandler)
    print("Dashboard Microservice running on 0.0.0.0:8000...", flush=True)
    httpd.serve_forever()
