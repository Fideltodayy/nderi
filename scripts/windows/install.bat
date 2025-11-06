@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0..\.."
echo Working directory: %CD%

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed. Install from https://nodejs.org/ then re-run.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not available. Ensure Node.js installation includes npm.
  exit /b 1
)

echo Installing dependencies...
call npm ci || (
  echo [ERROR] npm ci failed.
  exit /b 1
)

echo Building application...
call npm run build || (
  echo [ERROR] Build failed.
  exit /b 1
)

echo Done. Use scripts\windows\start.bat to run the app.
exit /b 0


