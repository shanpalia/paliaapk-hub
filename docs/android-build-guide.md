
# PLKAPK Hub: Android APK Build & Release Guide (Production)

This project uses Next.js 15 with Capacitor 6. Follow these steps to generate your production APK.

## 1. Environment Requirements
- **Node.js**: v18+
- **Android Studio**: Ladybug or newer
- **JDK**: 17
- **Next.js Export**: Enabled (output: 'export')

## 2. Build Web Assets (Static Export)
```bash
npm run build
```
This will generate the static files in the `out/` directory. Capacitor is configured to read from this folder.

## 3. Synchronize with Android Project
```bash
npx cap sync android
```
This copies the `out/` files into the Android project's assets.

## 4. Building the APK
### Via Command Line
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Via Android Studio (Recommended for Signing)
1. Open the `android/` folder in Android Studio.
2. Go to **Build > Generate Signed Bundle / APK...**
3. Select **APK**.
4. Create or select your Key Store.
5. Select the `release` build variant.
6. Click **Finish**.

## 5. Deployment Permissions
The app is pre-configured with:
- `REQUEST_INSTALL_PACKAGES`: To allow the Hub to install downloaded APKs.
- `INTERNET`: For Supabase data sync.
- `WRITE_EXTERNAL_STORAGE`: For binary buffering.

## 6. Project Export
To bundle the entire project for local development, run:
```bash
node scripts/export-project.js
```
Then download the generated `plkapk-hub-export.zip`.
