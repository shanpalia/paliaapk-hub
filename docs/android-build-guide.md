# PLKAPK Hub: Android Build & Release Guide

This document provides step-by-step instructions for generating a production-ready APK/AAB for PLKAPK Hub.

## Prerequisites

- **Node.js**: v18 or higher.
- **Android Studio**: Latest version (Ladybug or higher recommended).
- **Java Development Kit (JDK)**: 17.
- **Android SDK**: API Level 34+.

## 1. Prepare the Web Assets

Before creating the native project, ensure the latest web build is ready:

```bash
npm run build
npm run export
```

## 2. Initialize Native Project

If the `android` folder does not exist, initialize it:

```bash
npx cap add android
```

If it already exists, simply sync the assets:

```bash
npx cap sync
```

## 3. Configure Signing (Production)

To release on the Play Store or distribute a signed APK:

1. In Android Studio, open the `android` directory.
2. Go to **Build > Generate Signed Bundle / APK**.
3. Select **APK** or **Android App Bundle**.
4. Create a new KeyStore (keep this file safe!).
5. Enter your alias and password.
6. Select **Release** build variant.

## 4. Performance Optimization

The project is configured to use **ProGuard** for code shrinking and obfuscation. Ensure `minifyEnabled` is set to `true` in `android/app/build.gradle` for production builds.

## 5. Deployment Checklist

- [ ] Verify `com.plkapkhub.store` is the package name.
- [ ] Ensure Supabase URL/Key are in the production environment.
- [ ] Test the Admin Login flow on a physical device.
- [ ] Verify file download permissions in the `AndroidManifest.xml`.

## 6. Common Issues

### "App not installed"
Ensure you have uninstalled any previous versions of the app with the same package name but different signing certificates.

### Supabase Connectivity
If using a local emulator, ensure the network settings allow the Android Emulator to access `localhost` (usually via `10.0.2.2`). For production, ensure your Supabase RLS policies allow access from the app's User-Agent.
