# PaliaAPK Hub

The premium hub for verified Android binaries and apps. Powered by Next.js 15, Firebase, and GitHub Global Distribution.

## Features

- **Verified APK Repository**: Fast, secure downloads for Android devices.
- **AI-Powered Copywriting**: Automatic app description generation using Google Gemini.
- **Administrative Console**: Full management suite for apps, versions, and assets.
- **Native Android Support**: Built with Capacitor 6 for a seamless mobile experience.

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Firestore (Real-time updates & increments)
- **Authentication**: Firebase Auth (Multi-role clearance)
- **Styling**: Tailwind CSS + ShadCN UI
- **PWA**: Fully Integrated Service Workers & Install Prompt
- **Distribution**: GitHub Release API v3 Automation

## Infrastructure Configuration

Ensure your `.env` file contains the following keys for binary distribution:
- `GITHUB_TOKEN`: Your Personal Access Token with `repo` scope.
- `GITHUB_OWNER`: Your GitHub username.
- `GITHUB_REPO`: The repository for APK releases (e.g., `paliaapk-releases`).
