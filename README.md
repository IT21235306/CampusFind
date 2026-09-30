# CampusFind — SLIIT Lost & Found

CampusFind is a React Native mobile app and Node.js/Express API for found items and ownership claims. MongoDB Atlas stores users, items, claims, and uploaded photos. The backend is prepared for Vercel and the Android app for an Expo EAS APK.

## Features

- Registration and login with bcrypt, JWT, and protected screens and API routes.
- Full Item CRUD and validated image upload (JPG, PNG, WebP; 3 MB maximum).
- Full Claim CRUD with an `itemId → Item` reference and status changes.
- A transaction allows only one approved claim per item, changes the item to `Returned`, and rejects other pending claims.
- Input validation, ownership checks, loading/empty/error states, and API-fed mobile screens.

## Repository

`backend/` contains the Express API, models, middleware, GridFS storage, and demo seeder. `mobile/` contains the Expo app and APK build configuration. `docs/` contains architecture and API notes.

## Local setup

1. In `backend/`, run `npm install`. Copy `.env.example` to `.env`, set `MONGODB_URI` and a long random `JWT_SECRET`, then run `npm run start`.
2. Verify `http://localhost:4000/api/health`.
3. Optionally set `DEMO_PASSWORD` in the backend `.env` and run `npm run seed`, then `npm run seed:images`. These commands create three demo users, seven illustrated items, and three pending claims without deleting existing data.
4. In `mobile/`, run `npm install`. Create `.env` with `EXPO_PUBLIC_API_URL` set to the backend origin accessible to the device. The app appends `/api` itself. Run `npm start`.

This checkout has ignored local `backend/.env` and `backend/demo-credentials.txt` files. The latter contains the demo sign-in details. Never commit either file.

## Vercel deployment

1. Sign in with `vercel login`.
2. Deploy `backend/` as the Vercel project root. The Express entry point is `src/index.js`.
3. Configure `MONGODB_URI` and `JWT_SECRET` in the Vercel project environment. Keep values out of Git and the report.
4. Deploy production with `vercel --prod`. Check live health, authentication, CRUD, approval, and image upload routes.
5. MongoDB Atlas must allow Vercel's outbound connections. Vercel uses dynamic IPs; the documented Atlas integration uses a `0.0.0.0/0` access entry. Keep a strong database password and the URI server-side.

Uploaded images are stored in Atlas GridFS. They persist when a Vercel Function stops.

## APK build

1. Sign in with `eas login` in `mobile/`.
2. Set `EXPO_PUBLIC_API_URL` in the preview EAS environment to the production Vercel **origin**.
3. Run `eas build -p android --profile preview`.
4. Download the `.apk` and test it on a real Android device away from the development computer.

`mobile/eas.json` requests an installable APK for preview and an AAB for the optional store build. The API URL is public app configuration, not a secret.

## Coursework

The assignment requires one repository, a live backend URL, an 8–12 page report, a hosted-API demonstration, and a viva. Include environment variable **names** with values redacted. Disclose any AI assistance accurately and understand every implementation decision before the viva. No Git commits were made by Codex.
