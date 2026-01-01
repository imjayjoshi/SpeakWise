# SpeakWise 🎯

**AI-Powered Language Pronunciation Coach** - Practice, Record, Improve!

SpeakWise helps language learners practice pronunciation with real-time feedback on fluency, accuracy, and pronunciation. Built with modern web technologies and ready for production deployment.

## ✨ Features

- 🎤 **Speech Recognition** - Record and analyze pronunciation
- 📊 **Real-time Feedback** - Get instant scores on accuracy, fluency, and pronunciation
- 🌍 **Multi-language Support** - English and Japanese phrases
- 📈 **Progress Tracking** - Monitor improvement over time
- 👥 **User Management** - Separate user and admin interfaces
- 📚 **Phrase Library** - 60+ phrases across 3 difficulty levels
- 📤 **Data Export** - Export user data and phrases to Excel
- 🔒 **Secure Authentication** - JWT-based auth with bcrypt password hashing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/imjayjoshi/EchoLearn.git
cd SpeakWise

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend API URL
npm run dev
```

Visit `http://localhost:5173` to see the app!

## 📁 Project Structure

```
SpeakWise/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/     # 8 dynamic pages
│   │   ├── components/ # 57 reusable components
│   │   └── lib/       # API, utils, exports
│   └── package.json
├── backend/           # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── controllers/ # Business logic
│   │   ├── models/     # MongoDB schemas
│   │   ├── routes/     # API endpoints
│   │   └── middlewares/ # Auth & validation
│   └── package.json
├── DEPLOYMENT.md      # Deployment guide
└── README.md          # This file
```

## 🛠️ Tech Stack

**Frontend**:

- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + Radix UI
- React Router v7
- Axios + TanStack Query
- Recharts (analytics)
- XLSX (data export)

**Backend**:

- Node.js + Express 5
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt (password hashing)
- Helmet (security)
- Rate Limiting
- Compression

## 📖 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)** - Step-by-step deployment to production
- **[Frontend README](./frontend/README.md)** - Frontend-specific documentation
- **[Backend README](./backend/README.md)** - Backend API documentation

## 🔐 Security Features

- ✅ Helmet.js security headers
- ✅ Rate limiting (100 req/15min)
- ✅ CORS protection
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Environment variable protection
- ✅ Input validation

## 📊 Production Ready

- ✅ Zero console.log in frontend
- ✅ All pages dynamic with real data
- ✅ Build successful (25s)
- ✅ TypeScript compilation clean
- ✅ Security middleware implemented
- ✅ Health check endpoints
- ✅ Environment templates provided
- ✅ Comprehensive deployment guide
- ✅ Comprehensive testing suite

## 🧪 Testing

SpeakWise includes a comprehensive testing infrastructure covering all aspects of the application:

### Test Suites

- **Frontend Tests** - Component tests with Vitest + React Testing Library
- **Backend Tests** - Unit & integration tests with Jest + Supertest
- **E2E Tests** - End-to-end tests with Playwright (Chrome, Firefox, Safari, Mobile)
- **Performance Tests** - Load testing with Artillery
- **Security Tests** - Dependency scanning, CodeQL, secret detection

### Running Tests

```bash
# Run all tests
npm run test:all

# Individual test suites
npm run test:backend        # Backend unit tests
npm run test:frontend       # Frontend component tests
npm run test:e2e           # End-to-end tests
npm run test:performance   # Performance/load tests
npm run test:security      # Security audits
```

### Test Coverage

- **Backend**: >80% coverage (statements, branches, functions, lines)
- **Frontend**: >70% coverage (statements, branches, functions, lines)
- **E2E**: Complete user flow coverage across 5 browser configurations

### CI/CD Testing

Automated testing runs on every push/PR via GitHub Actions:

- ✅ Backend unit tests (Node 18.x, 20.x)
- ✅ Frontend component tests (Node 18.x, 20.x)
- ✅ E2E tests (multi-browser)
- ✅ Security scanning (weekly + on-demand)
- ✅ Coverage reporting

### Test Reports

```bash
# Generate coverage reports
cd backend && npm run test:coverage
cd frontend && npm run test:coverage

# View E2E test report
npm run test:e2e:report
```

## 🚀 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed deployment instructions.

**Recommended Platforms**:

- Backend: **Koyeb** (no sleep, always-on free tier) ✅
- Frontend: Vercel
- Database: MongoDB Atlas

## 👨‍💻 Author

**Jay Joshi** - [@imjayjoshi](https://github.com/imjayjoshi)

---

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: January 2026
