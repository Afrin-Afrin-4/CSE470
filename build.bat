@echo off
title IntelliLearn LMS Build Script

echo Building IntelliLearn LMS...
echo.

echo Building frontend...
cd lms-frontend
call npm install
call npm run build

echo.
echo Preparing backend...
cd ../lms-backend
call npm install

echo.
echo Build complete!
echo Frontend built to lms-frontend/dist/
echo Ready for deployment to Vercel and your preferred backend hosting platform.

pause