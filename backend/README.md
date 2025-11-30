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

## 🔌 API Endpoints

### Authentication (`/api/auth`)

```
POST   /auth/user/register      # Register new user
POST   /auth/user/login         # User login
POST   /auth/admin/login        # Admin login
POST   /auth/logout             # Logout
GET    /auth/me                 # Get current user
PUT    /auth/update-profile     # Update profile
PUT    /auth/update-password    # Change password
```

### Phrases (`/api/phrase`)

```
GET    /phrase/level/:level     # Get phrases by level
GET    /phrase/:id              # Get single phrase
POST   /phrase                  # Add phrase (admin)
PUT    /phrase/:id              # Update phrase (admin)
DELETE /phrase/:id              # Delete phrase (admin)
```

### Practice History (`/api/practice-history`)

```
GET    /practice-history        # Get user's practice history
POST   /practice-history        # Save practice result
GET    /practice-history/stats  # Get user statistics
```

### Admin (`/api/admin`)

```
GET    /admin/users             # Get all users
GET    /admin/users/:id         # Get user details
PUT    /admin/users/:id         # Update user
PUT    /admin/users/:id/password # Reset user password
DELETE /admin/users/:id         # Delete user
GET    /admin/dashboard-stats   # Get dashboard statistics
GET    /admin/phrases           # Get all phrases
```

### Health Check

```
GET    /health                  # Application health
GET    /ready                   # Database readiness
```

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

## 📊 Database Schema

### User Model
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  streak: Number,
  createdAt: Date
}
```

### Phrase Model
```javascript
{
  text: String,
  meaning: String,
  example: String,
  language: String,
  level: String (beginner/intermediate/expert),
  audioUrl: String,
  audioMeaningUrl: String,
  createdAt: Date
}
```

### Practice History Model
```javascript
{
  userId: ObjectId,
  phraseId: ObjectId,
  score: Number,
  accuracy: Number,
  fluency: Number,
  pronunciation: Number,
  wordAnalysis: Array,
  duration: Number,
  createdAt: Date
}
```

---

## 🔧 Configuration

### Environment Variables

Required:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT (min 32 chars)

Optional:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed frontend origin

### Rate Limiting

Current settings:
- Window: 15 minutes
- Max requests: 100 per IP
- Applies to: `/api/*` routes

### CORS

Allowed origins:
- Development: `http://localhost:5173`, `http://localhost:5174`
- Production: Set via `CORS_ORIGIN` env variable

---

## 📜 Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server (nodemon)
npm test           # Run tests (not implemented)
```

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
- Health check endpoint
- Database readiness check
- Uptime tracking

---

## 🔐 Authentication Flow

1. **Register**: User submits credentials → Password hashed → User created
2. **Login**: Credentials verified → JWT generated → Token sent in cookie
3. **Protected Routes**: Token verified → User data attached to request
4. **Logout**: Cookie cleared

**Token Details**:
- Expires: 7 days
- HTTP-only cookie
- Secure in production
- Includes user ID and role

---

## 🧪 Development Tips

### Testing API Endpoints

Use tools like:
- Postman
- Insomnia
- Thunder Client (VS Code)
- cURL

### Database Connection

MongoDB connection is established on server start. Check logs for:
```
DB connected
```

### Error Handling

All errors return JSON:
```json
{
  "message": "Error description",
  "error": "Details (dev only)"
}
```

### Logging

Console logs for:
- Database connection
- Server start
- Errors (production-safe)

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

## 🤝 Contributing

1. Follow Node.js best practices
2. Use async/await for async operations
3. Validate all inputs
4. Handle errors properly
5. Add comments for complex logic

---

## 📝 Notes

- All endpoints return JSON
- Authentication uses HTTP-only cookies
- Admin routes require admin role
- Database indexes on email, userId, phraseId
- Production-ready with security middleware

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
