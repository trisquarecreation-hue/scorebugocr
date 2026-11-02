@echo off
title SCOREBUG OCR - Free Public Live Tunnel
echo ========================================================
echo    SCOREBUG OCR - Free Live Public Web Server Tunnel
echo ========================================================
echo Creating a free public HTTPS web link via secure SSH tunnel...
echo No signup or account required!
echo ========================================================
echo.

start /B python server.py
timeout /t 2 >nul

ssh -p 443 -R0:localhost:8080 a.pinggy.io
pause
