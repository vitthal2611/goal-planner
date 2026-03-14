@echo off
echo Firebase Setup Script
echo.

REM Install Firebase CLI
echo Installing Firebase CLI...
call npm install -g firebase-tools

REM Login to Firebase
echo.
echo Logging in to Firebase...
call firebase login

REM Initialize Firebase
echo.
echo Initializing Firebase project...
call firebase init

echo.
echo Setup complete! Run deploy.bat to deploy your app.
pause




