@echo off
title SCOREBUG OCR Web Server
echo ========================================================
echo    SCOREBUG OCR - Official Web Server
echo ========================================================
echo Starting server on http://localhost:8080 ...
echo.

if exist ".venv\Scripts\python.exe" (
    start "" http://localhost:8080
    ".venv\Scripts\python.exe" server.py
) else (
    start "" http://localhost:8080
    python server.py
)

pause
