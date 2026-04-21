# HotCopper TGM/FAU Summary APK

This project contains:

- `backend`: crawler + summary API for TGM/FAU.
- `android`: Jetpack Compose app that shows summaries on launch.

## Backend API

- `GET /api/health`
- `GET /api/summary?ticker=TGM`
- `GET /api/summary?ticker=FAU`
- `GET /api/dashboard`
- `POST /api/refresh`

## Run Backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `OPENAI_API_KEY` (optional, fallback summary works without it).
3. Install dependencies and start:
   - `npm install`
   - `npm run dev`

## Android App

- Base URL is managed via `BuildConfig.API_BASE_URL` in `android/app/build.gradle.kts`.
- Set it to your deployed backend URL (must include trailing slash), for example:
  - `https://hotcopper-summary-api.onrender.com/`

## Deploy Backend on Render

1. Push this repo to GitHub.
2. In Render dashboard, create a **Blueprint** and select your repo.
3. Render reads `render.yaml` at repo root and creates service:
   - `hotcopper-summary-api`
4. In Render service settings, set env var:
   - `OPENAI_API_KEY` (optional; fallback summary works if unset)
5. After deploy, verify:
   - `https://<your-service>.onrender.com/api/health`
6. Put that URL into `API_BASE_URL`, rebuild APK, reinstall app.

## Build APK

1. Open `android` in Android Studio.
2. Sync Gradle.
3. Build debug APK:
   - `./gradlew assembleDebug`
4. Build signed release APK:
   - Copy `android/keystore.properties.example` to `android/keystore.properties`
   - Fill keystore values in `android/keystore.properties`
   - Run `./gradlew assembleRelease`

Signed APK output:
- `android/app/build/outputs/apk/release/app-release.apk`
