@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not "%~1"=="" (
  node tools\upload_images.js "%~1"
  pause
  exit /b
)
node tools\image_upload_server.js --open
pause
