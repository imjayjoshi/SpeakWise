# SpeakWise Deployment Guide 🚀

## Quick Start Deployment

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Vercel account (for frontend)
- Render/Railway account (for backend)

---

## Backend Deployment (Render/Railway)

### 1. Prepare MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier works)
3. Create database user with password
4. Whitelist all IPs (0.0.0.0/0) for production
5. Get connection string

### 2. Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `speakwise-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speakwise
   JWT_SECRET=your-super-secret-key-min-32-characters
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy the backend URL (e.g., `https://speakwise-backend.onrender.com`)

### Health Check
Visit: `https://your-backend-url.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-30T...",
  "uptime": 123.45,
  "environment": "production"
}
```

---

## Frontend Deployment (Vercel)

### 1. Update Environment Variable

1. Create `.env` file in frontend folder:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

2. Update `frontend/src/lib/api.ts` if needed (should already use `import.meta.env.VITE_API_URL`)

### 2. Deploy to Vercel

1. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

2. **Option A: Using Vercel Dashboard**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variable:
     - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
   - Click "Deploy"

3. **Option B: Using CLI**
   ```bash
   cd frontend
   vercel
   # Follow prompts
   # Add environment variable when prompted
   ```

4. Copy the frontend URL (e.g., `https://speakwise.vercel.app`)

### 3. Update Backend CORS

Go back to Render and update `CORS_ORIGIN`:
```
CORS_ORIGIN=https://speakwise.vercel.app
```

Redeploy backend if needed.

---

## Post-Deployment Checklist

### Backend
- [ ] Health check endpoint working (`/health`)
- [ ] Database connection successful (`/ready`)
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] CORS configured correctly
- [ ] Rate limiting active

### Frontend
- [ ] Application loads
- [ ] Login/Register working
- [ ] Dashboard displays data
- [ ] Practice flow works
- [ ] Admin panel accessible
- [ ] All API calls successful

### Testing
- [ ] Create test user account
- [ ] Practice a phrase
- [ ] Check feedback page
- [ ] Test admin login
- [ ] Verify phrase management
- [ ] Check user statistics

---

## Environment Variables Reference

### Backend (.env)
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speakwise?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## Monitoring & Maintenance

### Health Checks
- **Application Health**: `GET /health`
- **Database Health**: `GET /ready`

### Logs
- **Render**: Dashboard → Logs tab
- **Vercel**: Dashboard → Deployments → View Logs

### Database Backups
- MongoDB Atlas automatically backs up data
- Configure backup schedule in Atlas dashboard

---

## Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to database"
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check database user credentials

**Problem**: "CORS error"
- Verify `CORS_ORIGIN` matches frontend URL exactly
- Check for http vs https mismatch

**Problem**: "Rate limit exceeded"
- Adjust rate limit in `app.js`
- Current: 100 requests per 15 minutes

### Frontend Issues

**Problem**: "API calls failing"
- Verify `VITE_API_URL` is correct
- Check backend is running
- Check browser console for errors

**Problem**: "Build failing"
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies installed

---

## Security Best Practices

✅ **Implemented**:
- Helmet.js for security headers
- Rate limiting (100 req/15min)
- CORS protection
- JWT authentication
- Password hashing (bcrypt)
- Environment variables protected

⚠️ **Recommended**:
- Enable 2FA on hosting accounts
- Regular dependency updates (`npm audit`)
- Monitor error logs
- Set up uptime monitoring (UptimeRobot)

---

## Scaling Considerations

### When to Upgrade

**Free Tier Limits**:
- Render Free: Sleeps after 15min inactivity
- MongoDB Atlas Free: 512MB storage
- Vercel Free: Unlimited bandwidth

**Upgrade When**:
- \u003e 1000 active users
- \u003e 500MB database size
- Need 24/7 uptime
- Need faster response times

### Upgrade Path
1. Render: $7/month (no sleep)
2. MongoDB Atlas: $9/month (2GB)
3. Vercel: Free tier sufficient for most cases

---

## Support & Resources

- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Express Security**: https://expressjs.com/en/advanced/best-practice-security.html

---

## Quick Commands

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Production Build Test
```bash
# Frontend
cd frontend
npm run build
npm run preview
```

### Database Seed (Local Only)
```bash
cd backend
node seedPhrases.js
```

**Note**: Do NOT run seed script in production!

---

## Success! 🎉

Your SpeakWise application is now live and ready for users!

**Next Steps**:
1. Share the URL with users
2. Monitor logs for errors
3. Collect user feedback
4. Plan feature updates

Good luck with your deployment! 🚀
