# CampusFind

CampusFind is a SLIIT campus lost and found application. The mobile client uses React Native and Expo; the API uses Node.js, Express, Mongoose, and MongoDB Atlas. Members can post found items with photos, search listings, submit private ownership claims, and track returns. Administrators can moderate users, items, and claims inside the app.

## Project folders

| Folder | Purpose |
| --- | --- |
| `backend/` | Express API, MongoDB models, image storage, and optional seed scripts |
| `mobile/` | Expo app, Android EAS build profile, and image assets |
| `docs/` | API, architecture, and design notes |

The backend and mobile app have separate `package.json` files. Run their commands from the corresponding folder. The commands below use **Windows PowerShell** on a new PC.

## 1. Install the prerequisites

1. Install [Git](https://git-scm.com/downloads) and [Node.js 24 LTS](https://nodejs.org/en/download). The backend declares Node `24.x` in `backend/package.json`; npm is included with Node.
2. Open PowerShell and check the installations:

   ```powershell
   git --version
   node --version
   npm --version
   ```

3. For a **local backend**, have a MongoDB Atlas account and cluster. In Atlas, create a project and cluster if needed, create a database user under **Database Access**, add the new PC's public IP under **Network Access**, then copy the URI from **Connect → Drivers**. Replace its password placeholder with that user's password. The API creates and uses a database named `campusfind`; no local MongoDB installation or manual collection creation is needed.
4. For Android preview or cloud APK builds, have an [Expo account](https://expo.dev/signup). For a browser preview, no Android SDK or APK is required.

## 2. Get the project

```powershell
git clone https://github.com/IT21235306/CampusFind.git
cd CampusFind
```

If you already have the project folder, open PowerShell in that folder and skip cloning. Do not commit `.env` files, database credentials, or generated credential files.

For the quickest PC preview, you may skip the local backend in step 3 and point the mobile app to the existing hosted API in step 4. Complete step 3 when you want to run **both** services locally.

## 3. Configure and run the backend locally

Open the first PowerShell window at the repository root:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
notepad .env
```

Replace the placeholders in `backend/.env` with your **own** values. Keep the variable names exactly as shown:

```dotenv
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@HOST/campusfind
JWT_SECRET=PASTE_A_LONG_RANDOM_SECRET_HERE
PORT=4000
DEMO_PASSWORD=OPTIONAL_PRIVATE_DEMO_PASSWORD
```

`MONGODB_URI` and `JWT_SECRET` are required. `PORT` defaults to `4000`. `DEMO_PASSWORD` is needed only for the optional demo seeder and must contain at least eight characters. Generate a random JWT secret, then copy the output into `.env`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

If the Atlas password contains special URI characters, use the URI produced by Atlas or URL-encode the password. Do not put the MongoDB URI in `mobile/.env.local`; the app only talks to the API.

Start the server:

```powershell
npm run dev
```

Leave this window open. In a second PowerShell window, verify the API and Atlas connection:

```powershell
Invoke-RestMethod http://localhost:4000/api/health
```

Expected result: `status` is `ok` and `service` is `CampusFind API`. The bare `http://localhost:4000/` URL returns a 404 because the API routes begin with `/api`.

### Optional sample data and administrator

To create three demo users, seven items, three claims, and sample item images in the database named by your `.env`, run these commands in `backend/`:

```powershell
npm run seed
npm run seed:images
```

The seed script writes or updates the demo users' passwords using `DEMO_PASSWORD`; run it only against a database where you intend to create demo data. The images come from `mobile/assets/demo/`.

To create a new administrator with a generated password:

```powershell
npm run create:admin
```

The credentials are saved locally to ignored `backend/admin-credentials.txt`. If the admin account already exists, this command does not reset its password. Alternatively, register a normal account in the app, add `ADMIN_EMAIL=your-address@example.com` to `backend/.env`, then run:

```powershell
npm run grant:admin
```

The generated `admin-credentials.txt` and `demo-credentials.txt` files are private local files; they are not required for a fresh installation and are not in Git.

## 4. Configure and run the mobile app on the PC

Open another PowerShell window at the repository root:

```powershell
cd mobile
npm ci
Copy-Item .env.example .env.local
notepad .env.local
```

For a **browser preview with the local backend on the same PC**, set:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:4000
```

The value is the API **origin only**; do not append `/api`, because the app adds `/api` to each request. Save the file, then start the browser preview:

```powershell
npm run web -- --port 8082
```

Open `http://localhost:8082` in your browser. Leave both the backend and Expo terminal windows running. Register a new account, or sign in with a demo account if you ran the seed script. Stop a server with **Ctrl+C** in its terminal.

To test the PC preview against the **already hosted backend** instead, set `EXPO_PUBLIC_API_URL=https://campusfind-api.vercel.app` in `mobile/.env.local`, save the file, and reload the preview. That public URL is configuration, not a secret.

### Preview on an Android phone without an APK

Install Expo Go on the phone. Set `EXPO_PUBLIC_API_URL` in `mobile/.env.local` to the hosted API URL above, then run in `mobile/`:

```powershell
npm start
```

Scan the terminal QR code with Expo Go. The phone and PC should be on the same Wi-Fi network. If you want the phone to use the **local** backend instead, use the PC's LAN address, such as `http://192.168.1.25:4000`, in `.env.local`; `localhost` on the phone means the phone itself. Allow port `4000` through the PC firewall if needed. For an Android emulator using the local backend, use `http://10.0.2.2:4000`.

## 5. Check the source after setup

Run from `backend/`:

```powershell
npm run check
```

Run from `mobile/`:

```powershell
npm run lint
npx tsc --noEmit
npx expo-doctor
```

`npm ci` uses the committed lockfiles for reproducible dependency installation. If Node or npm is missing after installation, close and reopen PowerShell before retrying.

## 6. Deploy the backend to Vercel

The existing public health endpoint is [https://campusfind-api.vercel.app/api/health](https://campusfind-api.vercel.app/api/health). To deploy your own copy:

1. Import the Git repository in [Vercel](https://vercel.com/new).
2. Select **Root Directory: `backend`** and **Framework Preset: Express**. Leave the build and output overrides at their detected defaults.
3. In the Vercel project settings, add `MONGODB_URI` and `JWT_SECRET` for the relevant environments. Use the same variable names as in `backend/.env`, but enter the values in Vercel rather than committing `.env`.
4. Ensure Atlas Network Access permits the deployment to connect. Vercel's outbound IP can change; configure Atlas access deliberately and keep a strong database password.
5. Deploy and open `https://YOUR-PROJECT.vercel.app/api/health`. Then set the mobile `EXPO_PUBLIC_API_URL` to `https://YOUR-PROJECT.vercel.app` and test login, items, claims, and images.

For a separate CLI deployment from `backend/`, the equivalent commands are:

```powershell
npx vercel@latest login
npx vercel@latest
npx vercel@latest --prod
```

The first deployment may ask you to link or create a Vercel project. Configure its environment variables before relying on the API. A deployment saying **Ready** only confirms that the function was built; `/api/health` also checks its database connection.

## 7. Build an installable Android APK with EAS

The `mobile/eas.json` **preview** profile produces an APK. The **production** profile produces an AAB for store distribution. From `mobile/`:

```powershell
npx eas-cli@latest login
npx eas-cli@latest env:set --name EXPO_PUBLIC_API_URL --value https://YOUR-PROJECT.vercel.app --environment preview --visibility plaintext
npx eas-cli@latest build --platform android --profile preview
```

Use the Expo account that has access to the project linked in `mobile/app.json`. If using a different Expo account, link a new EAS project with `npx eas-cli@latest init` and update the project ownership before building. When the build finishes, open the EAS build link, download the `.apk`, install it on an Android device, and test login, photo uploads, items, claims, and admin access against the hosted API. An APK is **not** needed for the PC browser preview.

## Environment variable reference

| Location | Name | Purpose |
| --- | --- | --- |
| `backend/.env` or Vercel | `MONGODB_URI` | Private Atlas connection string; required |
| `backend/.env` or Vercel | `JWT_SECRET` | Private JWT signing secret; required |
| `backend/.env` | `PORT` | Local API port; optional, default `4000` |
| `backend/.env` | `DEMO_PASSWORD` | Password for optional demo accounts; optional |
| `backend/.env` | `ADMIN_EMAIL` | Existing account to promote with `grant:admin`; optional |
| `mobile/.env.local` or EAS | `EXPO_PUBLIC_API_URL` | Public backend origin, without `/api`; required for the app |

Never place `MONGODB_URI`, `JWT_SECRET`, or private passwords in an `EXPO_PUBLIC_` variable. Expo embeds public variables in the app bundle.

## Troubleshooting

| Problem | Check |
| --- | --- |
| `/api/health` fails | Confirm `MONGODB_URI`, Atlas database user, Atlas Network Access, and that the backend terminal is running. |
| Browser says API URL is not configured | Confirm `mobile/.env.local` contains `EXPO_PUBLIC_API_URL` and reload Expo. |
| Phone cannot reach local API | Use the PC's LAN IP instead of `localhost`; check Wi-Fi and firewall, or use the hosted API. |
| App can log in but images do not load | Confirm `/api/images/:id` is reachable on the configured backend origin. |
| EAS APK points to an old backend | Update the EAS `preview` variable and make a new build. Public variables are embedded at build time. |
| Admin tab is missing | Sign in with an account whose database role is `admin`; the backend also checks the role. |

Official references: [Expo local development](https://docs.expo.dev/get-started/start-developing/), [Expo environment variables](https://docs.expo.dev/guides/environment-variables/), [EAS APK builds](https://docs.expo.dev/build-reference/apk/), and [Express on Vercel](https://vercel.com/docs/frameworks/backend/express).
