const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const userModel = require('../models/user.model');

jest.setTimeout(30000);

describe('Middleware Tests', () => {
  beforeAll(async () => {
    const testDbUri = process.env.MONGODB_TEST_URI || process.env.MONGODB_URI;
    
    if (!testDbUri) {
      throw new Error('No MongoDB URI found');
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    await mongoose.connect(testDbUri);
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authentication Middleware', () => {
    it('should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    it('should accept requests with valid authentication token', async () => {
      // Register and login
      await request(app)
        .post('/api/auth/user/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Test@123'
        });

      const loginRes = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123'
        });

      const cookie = loginRes.headers['set-cookie'];

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['token=invalid-token'])
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('Admin Authorization Middleware', () => {
    let adminCookie;
    let userCookie;

    beforeEach(async () => {
      // Create admin
      await request(app)
        .post('/api/auth/user/register')
        .send({
          fullName: 'Admin User',
          email: 'admin@gmail.com',
          password: 'Admin@123'
        });

      const adminLoginRes = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'admin@gmail.com',
          password: 'Admin@123'
        });

      adminCookie = adminLoginRes.headers['set-cookie'];

      // Create regular user
      await request(app)
        .post('/api/auth/user/register')
        .send({
          fullName: 'Regular User',
          email: 'user@example.com',
          password: 'User@123'
        });

      const userLoginRes = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'user@example.com',
          password: 'User@123'
        });

      userCookie = userLoginRes.headers['set-cookie'];
    });

    it('should allow admin to access admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject non-admin users from admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', userCookie)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('admin');
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should apply rate limiting to API routes', async () => {
      // Make multiple requests quickly
      const requests = [];
      for (let i = 0; i < 110; i++) {
        requests.push(
          request(app)
            .post('/api/auth/user/login')
            .send({
              email: 'test@example.com',
              password: 'Test@123'
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // At least one request should be rate limited (429)
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Error Handling Middleware', () => {
    it('should handle 404 errors for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body).toBeDefined();
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/user/register')
        .send({
          fullName: 'A',
          email: 'invalid-email',
          password: 'weak'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('CORS Middleware', () => {
    it('should set CORS headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Security Headers Middleware (Helmet)', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      // Helmet sets various security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });
});
