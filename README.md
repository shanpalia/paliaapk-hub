
# PaliaAPK Hub

The premium hub for verified Android binaries and apps. Powered by Next.js 15, Supabase, and Capacitor.

## Features

- **Supabase APK Registry**: Instant uploads and real-time distribution.
- **AI-Powered Copywriting**: Automatic app description generation using Google Gemini.
- **Administrative Console**: Full management suite for apps, versions, and assets.
- **Native Android Support**: Built with Capacitor 6 for a seamless mobile experience.

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase PostgreSQL (Real-time updates)
- **Storage**: Supabase Storage (Fast binary distribution)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + ShadCN UI
- **PWA**: Fully Integrated Service Workers & Install Prompt

## Deployment

PaliaAPK Hub is designed for independent distribution. Apps are hosted on Supabase Storage and served instantly to the storefront.

```bash
npm run build
npx cap sync
```

See the `docs/` folder for more detailed build and maintenance guides.
