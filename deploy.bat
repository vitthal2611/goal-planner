@echo off
echo 🚀 Starting production deployment...

REM Clean previous build
if exist "dist" (
  echo 🧹 Cleaning previous build...
  rmdir /s /q dist
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci

REM Build for production
echo 🔨 Building for production...
call npm run build

if %errorlevel% equ 0 (
  echo ✅ Build successful!
  
  REM Deploy to Netlify
  echo 🌐 Deploying to Netlify...
  call npx netlify deploy --prod --dir=dist
  
  if %errorlevel% equ 0 (
    echo 🎉 Deployment successful!
  ) else (
    echo ❌ Deployment failed!
    exit /b 1
  )
) else (
  echo ❌ Build failed!
  exit /b 1
)

pause