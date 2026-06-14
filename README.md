# PLKAPK Hub 🚀

The ultimate, secure Android application marketplace. Built with Next.js, Capacitor, and Supabase.

## 📱 Features

- **Verified APK Repository**: Fast, secure downloads for Android devices.
- **AI-Powered Copywriting**: Automatic app description generation using Google Gemini.
- **Administrative Console**: Full management suite for apps, versions, and assets.
- **Native Android Support**: Built with Capacitor 6 for a seamless mobile experience.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend**: Supabase (Auth, Database, Storage)
- **Native**: Capacitor 6
- **AI**: Genkit + Google Gemini 2.5 Flash

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_ai_key
```

### 3. Native Android Build

After your Nix environment has reloaded with Gradle and JDK 17:

1. **Initialize the Gradle Wrapper**:
   ```bash
   npm run android:wrapper
   ```

2. **Sync the Project**:
   ```bash
   npx cap sync
   ```

3. **Generate the Debug APK**:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

The final APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 👨‍💻 Developed By

**Shan Palia**
