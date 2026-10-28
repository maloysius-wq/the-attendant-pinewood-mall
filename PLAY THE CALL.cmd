@echo off
setlocal
cd /d "%~dp0"
echo Starting Pinewood's local cinematic preview...
start "Pinewood Preview Server" powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0opening\serve-preview.ps1"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8765/"
echo Your browser will show Pinewood's main menu. Click NEW GAME to watch and hear The Call.
 echo Close the server console to stop the preview.
