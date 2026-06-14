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

## 2. Initialize Native Project & Gradle Wrapper

The Gradle Wrapper (`gradle-wrapper.jar`) is a binary file and is not included in the source code directly. To initialize it and the Android project:

```bash
# This command initializes the android directory and binary wrapper
npx cap add android

# If the directory already exists, run this to sync and update the wrapper
npx cap sync
```

## 3. Generate APK (Command Line)

After syncing, you can generate the APK directly:

```bash
cd android
./gradlew assembleDebug
```

The APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

## 4. Configure Signing (Production)

To release on the Play Store or distribute a signed APK:

1. In Android Studio, open the `android` directory.
2. Go to **Build > Generate Signed Bundle / APK**.
3. Select **APK** or **Android App Bundle**.
4. Create a new KeyStore (keep this file safe!).
5. Enter your alias and password.
6. Select **Release** build variant.

## 5. Deployment Checklist

- [ ] Verify `com.plkapkhub.store` is the package name.
- [ ] Ensure Supabase URL/Key are in the production environment.
- [ ] Test the Admin Login flow on a physical device.
- [ ] Verify file download permissions in the `AndroidManifest.xml`.

## 6. Common Issues

### "Could not find or load main class org.gradle.wrapper.GradleWrapperMain"
This occurs when the binary `gradle-wrapper.jar` is missing. Fix this by running `npx cap sync` on your local machine.

### "App not installed"
Ensure you have uninstalled any previous versions of the app with the same package name but different signing certificates.
