#!/bin/bash

# Build script for IntelliLearn LMS

echo "Building IntelliLearn LMS..."

# Build frontend
echo "Building frontend..."
cd lms-frontend
npm install
npm run build

# Build backend (optional, mainly for consistency)
echo "Preparing backend..."
cd ../lms-backend
npm install

echo "Build complete!"
echo "Frontend built to lms-frontend/dist/"
echo "Ready for deployment to Vercel and your preferred backend hosting platform."