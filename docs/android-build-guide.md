# PLKAPK Hub: Android APK Build & Release Guide

This document provides definitive instructions for generating a production-ready APK for PLKAPK Hub.

## 1. Prepare Environment
- **Node.js**: v18+
- **Android Studio**: Latest (Ladybug+)
- **JDK**: 17
- **Android SDK**: API Level 26+ (Supports Android 8.0 through Android 14)

## 2. Generate Web Assets
```bash
npm run build
```
This command generates the optimized static files in the `out/` (or `public/`) directory.

## 3. Sync Native Project
```bash
npx cap sync android
```
This command copies your Next.js build into the Android Studio project.

## 4. Build APK (Command Line)
To build a debug APK instantly:
```bash
cd android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

## 5. Production Release (Signed APK)
1. Open the `android` folder in **Android Studio**.
2. Select **Build > Generate Signed Bundle / APK**.
3. Choose **APK**.
4. Create/Select your keystore.
5. Select **Release** variant.
6. Click **Finish**.

## 6. Permissions Checklist
The Hub is pre-configured with:
- `INTERNET`: For Supabase data/storage.
- `REQUEST_INSTALL_PACKAGES`: Required to install APKs downloaded from the hub.
- `READ/WRITE_EXTERNAL_STORAGE`: For binary buffering.

## 7. App Icons & Splash Screens
To regenerate icons from a single source image:
```bash
npx @capacitor/assets generate --android
```
