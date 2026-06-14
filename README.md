# PLKAPK Hub 🚀

The ultimate, secure Android application marketplace. Built with Next.js, Capacitor, and Supabase.

## 📱 Features

- **Verified APK Repository**: Fast, secure downloads for Android devices.
- **AI-Powered Copywriting**: Automatic app description generation using Google Gemini.
- **Administrative Console**: Full management suite for apps, versions, and assets.
- **Native Android Support**: Built with Capacitor 6 for a seamless mobile experience.
- **Responsive Design**: Optimized for both mobile devices and desktop management.

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

### 3. Development

```bash
npm run dev
```

---

## 🤖 Android Build Instructions

To generate a native APK, follow these steps:

1. **Build the Web Project**:
   ```bash
   npm run build
   ```

2. **Sync with Capacitor**:
   ```bash
   npx cap sync
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

4. **Generate APK**:
   Inside Android Studio, go to `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

For a detailed guide on signing and releasing, see [docs/android-build-guide.md](./docs/android-build-guide.md).

---

## 👨‍💻 Developed By

**Shan Palia** - [GitHub](https://github.com/shanpalia)
