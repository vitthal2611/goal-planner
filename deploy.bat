@echo off
echo Deploying to Firebase...
echo.

REM Copy latest version
copy quick-track-demo.html public\index.html

REM Deploy to Firebase
firebase deploy

echo.
echo Deployment complete!
pause
