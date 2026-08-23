@echo off
REM Publishes media-src\ into resources\ and regenerates media.js.
REM Run this after adding, removing or re-ordering photographs.
cd /d "%~dp0"
python tools\build_media.py
if errorlevel 1 (
  echo.
  echo Media build failed. Is Pillow installed?  python -m pip install Pillow
  exit /b 1
)
echo.
echo Done. Start the site with start.bat to preview.