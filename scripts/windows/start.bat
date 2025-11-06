@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0..\.."

set PORT=%1
if "%PORT%"=="" set PORT=5000

echo Starting server on port %PORT% ...
set NODE_EXE=node
if exist "%~dp0..\..\node\node.exe" set NODE_EXE="%~dp0..\..\node\node.exe"

%NODE_EXE% scripts\start-server.mjs %PORT% || (
  echo [ERROR] Failed to start server. Did you run install.bat?
  exit /b 1
)

REM Small delay to allow server to bind
ping 127.0.0.1 -n 2 >nul

set TARGET=http://localhost:%PORT%
if not "%LIBRARY_HOST%"=="" set TARGET=http://%LIBRARY_HOST%:%PORT%

echo Opening %TARGET%
start "" "%TARGET%"
exit /b 0


