
# PaliaAPK Hub

The premium hub for verified Android binaries and apps. Powered by Next.js 15, Firebase, and GitHub Global Distribution.

## Exporting Source Code

To download the entire workspace source code for local development or manual backup:
1. Locate the **Download** icon in the top-right header of the Firebase Studio interface.
2. Click the icon to generate and download a `.zip` file containing all project files.

## GitHub Source Control Setup

To push this source code to your GitHub repository `paliaapk-hub`, follow these steps in your terminal:

1. **Initialize Git**:
   ```bash
   git init
   ```

2. **Add all files**:
   ```bash
   git add .
   ```

3. **Commit the code**:
   ```bash
   git commit -m "Initial commit: PaliaAPK Hub Source Code"
   ```

4. **Create the repository on GitHub**:
   Go to [github.com/new](https://github.com/new) and create a repository named `paliaapk-hub`. **Do not** initialize it with a README, license, or gitignore.

5. **Link and Push**:
   Replace `[YOUR_USERNAME]` with your actual GitHub username:
   ```bash
   git remote add origin https://github.com/[YOUR_USERNAME]/paliaapk-hub.git
   git branch -M main
   git push -u origin main
   ```

## Infrastructure Configuration

Ensure your `.env` file contains the following keys for binary distribution:
- `GITHUB_TOKEN`: Your Personal Access Token with `repo` scope.
- `GITHUB_OWNER`: Your GitHub username.
- `GITHUB_REPO`: The repository for APK releases (e.g., `paliaapk-releases`).

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Firestore (Real-time updates & increments)
- **Authentication**: Firebase Auth (Multi-role clearance)
- **Styling**: Tailwind CSS + ShadCN UI + Custom High-Radius Design
- **PWA**: Fully Integrated Service Workers & Install Prompt
- **Distribution**: GitHub Release API v3 Automation
