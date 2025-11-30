# SpeakWise Backend API 🚀

RESTful API server for SpeakWise pronunciation learning platform built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- npm

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create a `.env` file (or copy from `.env.example`):

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speakwise
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Production

```bash
npm start
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/           # Business logic
│   │   ├── auth.controller.js
│   │   ├── admin.controller.js
│   │   ├── phrase.controller.js
│   │   └── practiceHistory.controller.js
│   ├── models/                # MongoDB schemas
│   │   ├── User.js
│   │   ├── Phrase.js
│   │   └── PracticeHistory.js
│   ├── routes/                # API routes
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── phrase.routes.js
│   │   ├── practiceHistory.routes.js
│   │   └── health.routes.js
│   ├── middlewares/           # Custom middleware
│   │   └── auth.middleware.js
│   ├── db/                    # Database connection
│   │   └── db.js
│   └── app.js                 # Express app setup
├── server.js                  # Entry point
├── seedPhrases.js            # Database seeding
└── package.json
```

---

## 🛠️ Tech Stack

**Core**:
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM

**Authentication**:
- **JWT** - Token-based auth
- **bcryptjs** - Password hashing
- **cookie-parser** - Cookie handling

**Security**:
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

**Performance**:
- **compression** - Response compression

**Development**:
- **nodemon** - Auto-restart
- **dotenv** - Environment variables

---

## 🔌 API Overview

The backend provides RESTful APIs for:

- **Authentication** - User/admin login, registration, profile management
- **Phrases** - Phrase management and retrieval by difficulty level
- **Practice History** - Save and retrieve user practice sessions
- **Admin** - User management, statistics, and reports
- **Health** - Application and database health checks

For detailed API documentation, refer to the route files in `src/routes/`.

---

## 🔒 Security Features

**Implemented**:
- ✅ Helmet.js security headers
- ✅ Rate limiting (100 req/15min)
- ✅ CORS protection
- ✅ JWT authentication
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Environment variables
- ✅ Input validation
- ✅ Admin authorization

**Middleware Stack**:
1. Helmet (security headers)
2. Compression (response optimization)
3. Rate limiting (API protection)
4. CORS (cross-origin)
5. JSON parser
6. Cookie parser

---

## 🗄️ Database

**MongoDB Collections**:
- Users
- Phrases
- Practice History

For schema details, see the model files in `src/models/`.

---

## 🗄️ Database Seeding

To populate the database with sample phrases:

```bash
node seedPhrases.js
```

**Note**: Only run this in development! It adds 60 phrases (50 English + 10 Japanese).

---

## 🚀 Performance

**Optimizations**:
- ✅ Response compression
- ✅ Database indexing
- ✅ Connection pooling
- ✅ Efficient queries
- ✅ Rate limiting

**Monitoring**:
- Health check endpoint (`/health`)
- Database readiness check (`/ready`)
- Uptime tracking

---

## 🔐 Authentication

**Flow**:
1. User registers/logs in
2. JWT token generated
3. Token stored in HTTP-only cookie
4. Protected routes verify token
5. User data attached to request

**Token Details**:
- Expires: 7 days
- HTTP-only cookie
- Secure in production

---

## 📦 Dependencies

See `package.json` for complete list. Key dependencies:

- express: ^5.1.0
- mongoose: ^8.19.0
- bcryptjs: ^3.0.2
- jsonwebtoken: ^9.0.2
- helmet: ^8.1.0
- express-rate-limit: ^8.2.1
- compression: ^1.8.1

---

## 📝 License

MIT License - This is a personal project by Jay Joshi.

---

## 🆘 Troubleshooting

**Database connection fails**:
- Check `MONGODB_URI` is correct
- Verify network access in MongoDB Atlas
- Check database user credentials

**CORS errors**:
- Verify `CORS_ORIGIN` matches frontend URL
- Check for http vs https mismatch
- Ensure credentials are enabled

**JWT errors**:
- Check `JWT_SECRET` is set
- Verify token hasn't expired
- Clear cookies and login again

**Rate limit exceeded**:
- Wait 15 minutes
- Adjust limits in `app.js` if needed

---

For deployment instructions, see the main [DEPLOYMENT.md](../DEPLOYMENT.md) guide.
