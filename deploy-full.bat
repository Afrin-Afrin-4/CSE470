@echo off
title IntelliLearn Full Deployment

echo ========================================
echo IntelliLearn LMS Full Deployment
echo ========================================
echo.

echo 1. Deploying Frontend to Vercel...
cd lms-frontend
echo Building frontend...
call npm run build
echo Deploying frontend...
call vercel --prod --confirm
cd ..

echo.
echo 2. Deploying Backend to Railway...
cd lms-backend
echo Initializing Railway project...
call railway init
echo Deploying backend...
call railway up
cd ..

echo.
echo Deployment complete!
echo.
echo Next steps:
echo 1. Note the URLs provided by Vercel and Railway
echo 2. Update the backend URL in lms-frontend/vercel.json
echo 3. Redeploy the frontend with the updated configuration
echo.
pause