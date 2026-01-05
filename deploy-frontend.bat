@echo off
title IntelliLearn Frontend Deployment

echo ========================================
echo IntelliLearn LMS Frontend Deployment
echo ========================================
echo.

echo 1. Building frontend...
cd lms-frontend
call npm run build

echo.
echo 2. Deploying to Vercel...
call vercel --prod

echo.
echo Deployment complete!
echo.
echo If you encounter any issues:
echo 1. Make sure you're logged into Vercel (vercel login)
echo 2. Check that the dist folder was created correctly
echo 3. Verify your vercel.json configuration
echo.
pause