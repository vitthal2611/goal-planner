#!/bin/bash

echo "🚀 Starting production deployment..."

# Check if build directory exists and clean it
if [ -d "dist" ]; then
  echo "🧹 Cleaning previous build..."
  rm -rf dist
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run build
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  # Deploy to Netlify
  echo "🌐 Deploying to Netlify..."
  npx netlify deploy --prod --dir=dist
  
  if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "📊 Build size:"
    du -sh dist/
  else
    echo "❌ Deployment failed!"
    exit 1
  fi
else
  echo "❌ Build failed!"
  exit 1
fi