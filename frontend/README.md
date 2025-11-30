# SpeakWise Frontend 🎨

Modern, responsive web application for language pronunciation practice with real-time feedback.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create a `.env` file (or copy from `.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/              # 8 main pages
│   │   ├── Dashboard.tsx   # User dashboard
│   │   ├── Practice.tsx    # Practice interface
│   │   ├── Feedback.tsx    # Feedback & results
│   │   ├── ProgressPage.tsx # Progress tracking
│   │   ├── UserProfile.tsx  # User settings
│   │   ├── LevelPhrases.tsx # Phrase selection
│   │   └── admin/          # Admin pages (4)
│   ├── components/         # 57 reusable components
│   │   ├── ui/            # Shadcn UI components
│   │   ├── Navbar.tsx     # Navigation
│   │   └── ...            # Custom components
│   ├── lib/               # Utilities
│   │   ├── api.ts         # API client
│   │   ├── utils.ts       # Helper functions
│   │   └── exportUtils.ts # Excel export
│   ├── hooks/             # Custom React hooks
│   ├── routes/            # Routing configuration
│   └── assets/            # Static assets
├── public/                # Public files
└── package.json
```

---

## 🛠️ Tech Stack

**Core**:
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server

**UI & Styling**:
- **TailwindCSS** - Utility-first CSS
- **Shadcn/ui** - Component library
- **Radix UI** - Accessible primitives
- **Lucide React** - Icon library

**Data & State**:
- **Axios** - HTTP client
- **TanStack Query** - Data fetching
- **React Hook Form** - Form management
- **Zod** - Schema validation

**Routing & Navigation**:
- **React Router v7** - Client-side routing

**Features**:
- **Recharts** - Data visualization
- **XLSX** - Excel export
- **Sonner** - Toast notifications
- **date-fns** - Date utilities

---

## ✨ Key Features

### User Features
- 🎤 **Speech Recognition** - Record pronunciation with browser API
- 📊 **Real-time Feedback** - Instant scores on accuracy, fluency, pronunciation
- 📈 **Progress Tracking** - Visual charts and statistics
- 🌍 **Multi-language** - English and Japanese phrases
- 🎯 **Difficulty Levels** - Beginner, Intermediate, Expert
- 👤 **User Profile** - Manage account and settings
- 🔐 **Secure Auth** - JWT-based authentication

### Admin Features
- 👥 **User Management** - View, edit, delete users
- 📚 **Phrase Management** - Add, edit, delete phrases
- 📊 **Reports & Analytics** - User statistics and insights
- 📤 **Data Export** - Export to Excel
- ⚙️ **Settings** - System configuration

---

## 🎨 Design System

**Colors**:
- Primary: Blue gradient
- Success: Green
- Warning: Orange
- Error: Red
- Neutral: Gray scale

**Typography**:
- Font: System fonts (optimized)
- Headings: Bold, large
- Body: Regular, readable

**Components**:
- Consistent spacing (Tailwind)
- Accessible (WCAG AA)
- Responsive (mobile-first)
- Dark mode ready

---

## 📜 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## 🔧 Configuration

### Environment Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:5000/api`)

### Build Configuration

- **Vite Config**: `vite.config.js`
- **TypeScript**: `tsconfig.json`
- **Tailwind**: `tailwind.config.js`
- **ESLint**: `eslint.config.js`

---

## 🚀 Performance

**Optimizations**:
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Asset optimization
- ✅ Tree shaking
- ✅ Minification
- ✅ Compression

**Build Output**:
- Bundle size: Optimized
- Build time: ~25 seconds
- Load time: Fast

---

## 🔒 Security

- ✅ XSS protection (React)
- ✅ CSRF tokens
- ✅ Secure cookies
- ✅ Input validation
- ✅ Environment variables

---

## 📱 Responsive Design

**Breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Features**:
- Mobile-first approach
- Touch-friendly UI
- Adaptive layouts
- Optimized images

---

## 🧪 Development Tips

### API Integration

The app uses `axios` with a base URL from environment variables:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

### CORS Issues

If you encounter CORS errors:
1. Ensure backend is running
2. Check backend CORS configuration
3. Verify `VITE_API_URL` is correct

### Hot Module Replacement

Vite provides instant HMR for fast development. Changes appear immediately without full page reload.

---

## 📦 Dependencies

See `package.json` for complete list. Key dependencies:

- react: ^18.3.1
- typescript: ^5.8.3
- vite: ^7.1.9
- tailwindcss: ^3.4.17
- axios: ^1.12.2
- react-router: ^7.9.4

---

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use existing components when possible
3. Maintain consistent styling
4. Test on multiple browsers
5. Ensure responsive design

---

## 📝 Notes

- All pages are dynamic (no hardcoded data)
- Zero console.log statements in production
- TypeScript strict mode enabled
- Build tested and working
- Production-ready

---

## 🆘 Troubleshooting

**Build fails**:
- Run `npm install` again
- Check Node.js version (18+)
- Clear `node_modules` and reinstall

**API not connecting**:
- Check `VITE_API_URL` in `.env`
- Ensure backend is running
- Check browser console for errors

**Styles not loading**:
- Run `npm run dev` again
- Check Tailwind configuration
- Clear browser cache

---

For deployment instructions, see the main [DEPLOYMENT.md](../DEPLOYMENT.md) guide.
