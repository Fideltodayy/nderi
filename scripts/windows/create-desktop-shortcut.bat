@echo off
setlocal enabledelayedexpansion

REM Creates a desktop URL shortcut to the app
REM Usage: create-desktop-shortcut.bat [hostname] [port]

set HOST=%1
if "%HOST%"=="" set HOST=localhost
set PORT=%2
if "%PORT%"=="" set PORT=5000

for /f "tokens=2*" %%A in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v Desktop ^| findstr Desktop') do set DESKTOP=%%B

set SHORTCUT="%DESKTOP%\Library System.url"
(
  echo [InternetShortcut]
  echo URL=http://%HOST%:%PORT%
  echo IconIndex=0
  echo IconFile=%SystemRoot%\system32\shell32.dll
) > %SHORTCUT%

echo Created desktop shortcut: %SHORTCUT%
exit /b 0


