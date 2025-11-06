@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0..\.."

set PORT=%1
if "%PORT%"=="" set PORT=5000

if not exist node\node.exe (
  echo [ERROR] Portable Node runtime not found at .\node\node.exe
  echo Run scripts\windows\package-zip.bat to create a portable bundle or place Node zip here.
  exit /b 1
)

echo Starting server (portable) on port %PORT% ...
"node\node.exe" scripts\start-server.mjs %PORT% || (
  echo [ERROR] Failed to start server.
  exit /b 1
)

ping 127.0.0.1 -n 2 >nul
start "" "http://localhost:%PORT%"
exit /b 0


