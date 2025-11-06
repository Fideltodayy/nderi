@echo off
setlocal enabledelayedexpansion

REM Creates a portable zip in release\nderi-portable.zip with embedded Node runtime
REM Requires PowerShell (available on Windows 10+)

cd /d "%~dp0..\.."
set ROOT=%CD%
set REL=%ROOT%\release
set OUTDIR=%REL%\nderi-portable

if not exist "%REL%" mkdir "%REL%"
if exist "%OUTDIR%" rmdir /s /q "%OUTDIR%"
mkdir "%OUTDIR%"

echo [1/5] Building portable server and client...
call npm run build:portable || (
  echo Build failed.
  exit /b 1
)

echo [2/5] Copying runtime files...
mkdir "%OUTDIR%\dist"
xcopy /e /i /y "%ROOT%\dist" "%OUTDIR%\dist" >nul
mkdir "%OUTDIR%\scripts\windows"
xcopy /e /i /y "%ROOT%\scripts\windows" "%OUTDIR%\scripts\windows" >nul
mkdir "%OUTDIR%\scripts"
copy /y "%ROOT%\scripts\start-server.mjs" "%OUTDIR%\scripts\start-server.mjs" >nul

echo [3/5] Downloading portable Node.js (LTS x64)...
set NODE_ZIP=%REL%\node-win-x64.zip
set NODE_DIR=%OUTDIR%\node

REM Choose an LTS version; adjust as needed
set NODE_URL=https://nodejs.org/dist/v20.17.1/node-v20.17.1-win-x64.zip

powershell -NoProfile -ExecutionPolicy Bypass -Command "^$wc=New-Object Net.WebClient; ^$wc.DownloadFile('%NODE_URL%','%NODE_ZIP%')" || (
  echo Failed to download Node runtime.
  exit /b 1
)
mkdir "%NODE_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Force '%NODE_ZIP%' '%REL%\node-unzip'" || (
  echo Failed to extract Node.
  exit /b 1
)
for /d %%D in ("%REL%\node-unzip\node-*-win-x64") do xcopy /e /i /y "%%D" "%NODE_DIR%" >nul
rmdir /s /q "%REL%\node-unzip" >nul 2>nul
del /f /q "%NODE_ZIP%" >nul 2>nul

echo [4/5] Adding portable start scripts and README...
copy /y "%ROOT%\scripts\windows\start-portable.bat" "%OUTDIR%\start.bat" >nul
copy /y "%ROOT%\scripts\windows\stop.bat" "%OUTDIR%\stop.bat" >nul
(
  echo Portable Library System
  echo.
  echo Start: double-click start.bat  ^(opens http://localhost:5000^)
  echo Stop:  double-click stop.bat
  echo.
  echo Data persistence: stored in your browser's IndexedDB for http://localhost:5000.
  echo Keep using the same host/port to keep the same data.
) > "%OUTDIR%\README_portable.txt"

echo [5/5] Creating zip archive...
if exist "%REL%\nderi-portable.zip" del /f /q "%REL%\nderi-portable.zip"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Force -Path '%OUTDIR%\*' -DestinationPath '%REL%\nderi-portable.zip'"

echo Done. Portable zip at: %REL%\nderi-portable.zip
exit /b 0


