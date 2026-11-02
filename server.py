#!/usr/bin/env python3
"""
SCOREBUG OCR — Official Web Platform Server
Serves the website, handles file downloads for Windows & iOS packages,
and provides zero-dependency hosting.
"""

import os
import sys
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

WIN_ZIP = os.path.join(BASE_DIR, "SCOREBUG_OCR_Windows.zip")
IOS_ZIP = os.path.join(BASE_DIR, "ScoreBugOCR_iOS.zip")

class ScorebugWebHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_GET(self):
        path_lower = self.path.lower().split("?")[0]

        # 1. Direct Executable Download: SCOREBUG_OCR.exe
        if path_lower in ["/scorebug_ocr.exe", "/download/scorebug_ocr.exe", "/download/exe"]:
            exe_target = os.path.join(BASE_DIR, "SCOREBUG_OCR.exe")
            if os.path.exists(exe_target):
                file_size = os.path.getsize(exe_target)
                self.send_response(200)
                self.send_header("Content-Type", "application/vnd.microsoft.portable-executable")
                self.send_header("Content-Disposition", 'attachment; filename="SCOREBUG_OCR.exe"')
                self.send_header("Content-Length", str(file_size))
                self.end_headers()
                with open(exe_target, 'rb') as f:
                    while chunk := f.read(64 * 1024):
                        self.wfile.write(chunk)
                return
            else:
                self.send_error(404, "SCOREBUG_OCR.exe file not found.")
                return

        # 2. Windows Zip Package Route
        if path_lower in [
            "/scorebug_ocr_windows.zip",
            "/download/windows",
            "/scorebug_ocr_setup.exe",
            "/download/scorebug_ocr_setup.exe",
            "/scorebug_payload.zip"
        ]:
            target = WIN_ZIP if os.path.exists(WIN_ZIP) else os.path.join(BASE_DIR, "scorebug_payload.zip")
            if os.path.exists(target):
                file_size = os.path.getsize(target)
                self.send_response(200)
                self.send_header("Content-Type", "application/zip")
                self.send_header("Content-Disposition", 'attachment; filename="SCOREBUG_OCR_Windows.zip"')
                self.send_header("Content-Length", str(file_size))
                self.end_headers()
                with open(target, 'rb') as f:
                    while chunk := f.read(128 * 1024):
                        self.wfile.write(chunk)
                return
            else:
                self.send_error(404, "Windows application package not found.")
                return

        # 2. iOS Download Route
        if path_lower in [
            "/scorebugocr_ios.zip",
            "/download/ios",
            "/download/scorebugocr_ios.zip"
        ]:
            if os.path.exists(IOS_ZIP):
                file_size = os.path.getsize(IOS_ZIP)
                self.send_response(200)
                self.send_header("Content-Type", "application/zip")
                self.send_header("Content-Disposition", 'attachment; filename="ScoreBugOCR_iOS.zip"')
                self.send_header("Content-Length", str(file_size))
                self.end_headers()
                with open(IOS_ZIP, 'rb') as f:
                    while chunk := f.read(64 * 1024):
                        self.wfile.write(chunk)
                return
            else:
                self.send_error(404, "iOS source package not found.")
                return

        # 3. Clean route for /thank-you
        if path_lower in ["/thank-you", "/thankyou"]:
            target = os.path.join(BASE_DIR, "thank-you.html")
            if os.path.exists(target):
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                with open(target, 'rb') as f:
                    self.wfile.write(f.read())
                return

        return super().do_GET()

def main():
    server_address = ('0.0.0.0', PORT)
    httpd = HTTPServer(server_address, ScorebugWebHandler)
    print("=======================================================")
    print("  SCOREBUG OCR — Official Web Server")
    print("=======================================================")
    print(f"  * Web URL:            http://localhost:{PORT}")
    print(f"  * Windows Download:   http://localhost:{PORT}/SCOREBUG_OCR_Windows.zip")
    print(f"  * iOS Download:       http://localhost:{PORT}/ScoreBugOCR_iOS.zip")
    print(f"  * Project Directory:  {BASE_DIR}")
    print("=======================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.server_close()

if __name__ == '__main__':
    main()
