# Frontend — SpeakWise

This folder contains the client application built with React, Vite and TypeScript. The UI talks to the backend API to authenticate users, fetch and practice phrases, and display progress.

Status: In development — core pages and components are present. Environment configuration and small integration details may still change.

## Requirements

- Node.js v16+ (v18+ recommended)
- npm or yarn

## Install

Open a terminal and run:

```bash
cd frontend
npm install
```

## Environment

The frontend uses Vite. The base API URL can be configured with an environment variable at build/dev time:

- `VITE_API_URL` — base URL for the backend API (default: `http://localhost:3000/api`)

Create a `.env` or `.env.local` file in the `frontend` folder if you want to override the default. Example:

```env
VITE_API_URL=http://localhost:3000/api
```

## Run (development)

Start the dev server:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` (Vite will show the exact URL) to view the app.

## Build / Preview

```bash
npm run build
npm run preview
```

## Useful scripts

- `npm run dev` — run development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint checks

## Notes & tips

- API calls use `import.meta.env.VITE_API_URL` and default to `http://localhost:3000/api`.
- The UI expects the backend to serve JSON APIs under `/api` (e.g. `/api/auth/user/login`).
- If you change the backend port or API path, update `VITE_API_URL`.

If you run into CORS or auth cookie issues while developing locally, confirm the backend is running and allows CORS from the frontend origin.

# SpeakWise Frontend

A modern web application for learning through voice and speech recognition, built with React, TypeScript, and Tailwind CSS.

## Project Overview

SpeakWise's frontend is a responsive and user-friendly interface that helps users practice and improve their language skills through voice interaction. The application features a clean design with both light and dark modes, and provides real-time feedback on user performance.

## Tech Stack

- **React** - Frontend library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Reusable component library
- **React Router** - Client-side routing
- **Vite** - Build tool and development server

## Project Structure

```
frontend/
├── src/
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # Reusable React components
│   │   ├── ui/         # Shadcn UI components
│   │   └── ...         # Custom components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and helpers
│   ├── pages/          # Page components
│   ├── App.tsx         # Root component
│   └── main.tsx        # Entry point
├── public/             # Public assets
└── package.json        # Project dependencies
```

## Key Features

- **Authentication System**: Secure user authentication and authorization
- **Dashboard**: Personal progress tracking and learning statistics
- **Practice Interface**: Interactive voice-based learning exercises
- **Progress Tracking**: Visual representation of learning progress
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Design System

The application uses a consistent design system with:

- Custom UI components built with Shadcn/ui
- Responsive layouts using Tailwind CSS
- Consistent typography and spacing
- Accessible components following WCAG guidelines

## State Management

- Local state management using React hooks
- Persistent storage for user preferences

## Performance Features

- Vite-powered development with HMR (Hot Module Replacement)
- Code splitting for optimal load times
- Asset optimization
- Lazy loading of components
- Efficient routing system

## Screenshots

Screenshots of the application can be found in the `docs/screenshots` directory. For convenience, a gallery of the current screenshots is embedded below so team members and contributors can preview key screens without opening the folder.

### User screens

![Landing Page](docs/screenshots/User/LandingPage.png)
_Landing page with hero section and call-to-action._

![Sign Up](docs/screenshots/User/SignUp.png)
_Sign up form / onboarding flow._

![Sign In](docs/screenshots/User/SignIn.png)
_Sign in / authentication screen._

![Features](docs/screenshots/User/Features.png)
_Features page highlighting app capabilities._

![Works](docs/screenshots/User/Works.png)
_How it works / user flow explanation._

![Footer](docs/screenshots/User/Footer.png)
_Footer section example with links and copyright._

### Dashboard

![Dashboard 1](docs/screenshots/Dashboard/Dashboard-1.png)
_Dashboard — main overview, widgets and stats._

![Dashboard 2](docs/screenshots/Dashboard/Dashboard-2.png)
_Dashboard — alternate view with detailed panels._

![Progress 1](docs/screenshots/Dashboard/Progress-1.png)
_Progress — user progress visualization and charts._

![Progress 2](docs/screenshots/Dashboard/Progress-2.png)
_Progress — another view of progress tracking._

![Practice Mode](docs/screenshots/Dashboard/Practice.png)
_Practice — interactive practice interface with voice input._

![Feedback 1](docs/screenshots/Dashboard/Feedback-1.png)
_Feedback — example of feedback provided after a practice session._

![Feedback 2](docs/screenshots/Dashboard/Feedback-2.png)
_Feedback — score breakdown and suggestions._

![Feedback 3](docs/screenshots/Dashboard/Feedback-3.png)
_Feedback — detailed corrections and tips._

### Admin

![Admin Dashboard](docs/screenshots/Admin/adminDashboard.png)
_Admin — main admin dashboard overview._

![Admin Dashboard 2](docs/screenshots/Admin/adminDashboard2.png)
_Admin — alternate dashboard / overview._

![User Management](docs/screenshots/Admin/userManagement.png)
_Admin — manage users and roles._

![Phrases Management](docs/screenshots/Admin/PhrasesManagement.png)
_Admin — add/edit/remove phrases used in exercises._

![Add Phrase](docs/screenshots/Admin/addPhrase.png)
_Admin — form to add a new phrase._

![Profile & Settings](docs/screenshots/Admin/profileSetting.png)
_Admin — profile and settings page._

![Profile & Settings 2](docs/screenshots/Admin/profileSetting2.png)
_Admin — alternate profile/settings view._

![Reports & Analysis](docs/screenshots/Admin/reportAnalysis.png)
_Admin — reports and analytics view._
