# Backend — SpeakWise API

This folder contains the Express.js API, MongoDB models, controllers and routes that power the SpeakWise application.

Status: In development — core endpoints for authentication, phrases and practice history exist. Some environment configuration and docs remain incomplete.

## Requirements

- Node.js v16+ (v18+ recommended)
- npm
- A MongoDB database (Atlas or local)

## Install

```bash
cd backend
npm install
```

## Environment variables

Create a `.env` file in the `backend` folder with at least the following variables:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_here
# Optional: credentials for Google Text-to-Speech if used
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-creds.json
# PORT=3000
```

## Run (development)

The project includes `nodemon` as a dependency. From the `backend` folder you can run:

```bash
# Start with node
node server.js

# Or use nodemon for automatic reloads
npx nodemon server.js
```

Note: The project entrypoint `server.js` expects the API to be reachable at port `3000` by default. If you change the `PORT` env var, ensure the frontend config (`VITE_API_URL`) points to the updated URL.

## API layout (high level)

- `/api/auth/*` — authentication (register, login, logout, me)
- `/api/phrase/*` — phrase retrieval, add/update/delete, practice endpoints
- `/api/practice-history/*` — user practice history and statistics
- `/api/admin/*` — admin-only endpoints for users and phrases

## Notes & troubleshooting

- Ensure `MONGODB_URI` is correct and accessible from your machine.
- The backend uses cookies for authentication — when calling APIs from the frontend, the client sets `withCredentials: true` (already configured in the frontend API client).
- If you use Google Cloud Text-to-Speech features, set `GOOGLE_APPLICATION_CREDENTIALS` to the path of your service account key JSON file.

## Next steps (suggested)

- Add `start` / `dev` scripts to `backend/package.json` for convenience (e.g., `nodemon server.js`).
- Provide a Postman/Insomnia collection for the core APIs.
