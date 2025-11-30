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

✅ Helmet.js security headers
✅ Rate limiting (100 req/15min)
✅ CORS protection
✅ JWT authentication
✅ Password hashing with bcrypt
✅ Environment variable protection
✅ Input validation

## 📊 Production Ready

- ✅ Zero console.log in frontend
- ✅ All pages dynamic with real data
- ✅ Build successful (25s)
- ✅ TypeScript compilation clean
- ✅ Security middleware implemented
- ✅ Health check endpoints
- ✅ Environment templates provided
- ✅ Comprehensive deployment guide

## 🚀 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed deployment instructions.

**Recommended Platforms**:
- Backend: Render / Railway
- Frontend: Vercel
- Database: MongoDB Atlas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is part of an academic project (MCA SEM-3 SD).

## 👨‍💻 Author

**Jay Joshi** - [@imjayjoshi](https://github.com/imjayjoshi)

## 🆘 Support

If you encounter any issues:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review frontend/backend README files
3. Open an issue with error details and OS information

---

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: November 2025
