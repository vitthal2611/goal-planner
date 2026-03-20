#!/bin/bash

# Life Tracker React - Deployment Script

echo "🚀 Starting deployment process..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run build
echo "🔨 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo "✅ Deployment successful!"
echo "🎉 Your app is now live!"
