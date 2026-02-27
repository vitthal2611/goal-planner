@echo off
echo Deploying Firebase Database Rules...
firebase deploy --only database
echo.
echo Done! Rules deployed successfully.
pause
