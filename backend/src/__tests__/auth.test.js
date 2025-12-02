require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const userModel = require('../models/user.model');

// Increase timeout for integration tests
jest.setTimeout(30000);

describe('Authentication Endpoints', () => {
  // Setup: Connect to test database
  beforeAll(async () => {
    // Use test database
    const testDbUri = process.env.MONGODB_TEST_URI || process.env.MONGODB_URI;
    
    if (!testDbUri) {
      throw new Error('No MongoDB URI found. Please set MONGODB_URI in .env file');
    }

    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    // Connect to test database
    await mongoose.connect(testDbUri);
  });

  // Cleanup: Clear users after each test
  afterEach(async () => {
    await userModel.deleteMany({});
  });

  // Teardown: Close database connection
  afterAll(async () => {
    await userModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/user/register', () => {
    test('should register a new user with valid data', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Test@123'
      };

      const response = await request(app)
        .post('/api/auth/user/register')
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User Created Successfully');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('fullName', userData.fullName);
      expect(response.body.user).toHaveProperty('role', 'learner');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should create admin user for admin@gmail.com', async () => {
      const adminData = {
        fullName: 'Admin User',
        email: 'admin@gmail.com',
        password: 'Admin@123'
      };

      const response = await request(app)
        .post('/api/auth/user/register')
        .send(adminData)
        .expect(200);

      expect(response.body.user.role).toBe('admin');
    });

    test('should reject registration with existing email', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Test@123'
      };

      // Register first time
      await request(app)
        .post('/api/auth/user/register')
        .send(userData);

      // Try to register again
      const response = await request(app)
        .post('/api/auth/user/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should reject registration with invalid email', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'invalid-email',
        password: 'Test@123'
      };

      const response = await request(app)
        .post('/api/auth/user/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should reject registration with weak password (no uppercase)', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'test@123'
      };

      const response = await request(app)
        .post('/api/auth/user/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should reject registration with weak password (no special char)', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Test1234'
      };

      const response = await request(app)
        .post('/api/auth/user/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject registration with short password', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Test@1'
      };

      const response = await request(app)
        .post('/api/auth/user/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject registration with invalid full name', async () => {
      const userData = {
        fullName: 'A',
        email: 'test@example.com',
        password: 'Test@123'
      };

      const response = await request(app)
        .post('/api/auth/user/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/user/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/user/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Test@123'
        });
    });

    test('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login Successful');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword@123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    test('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'invalid-email',
          password: 'Test@123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/user/logout', () => {
    test('should logout user and clear cookie', async () => {
      const response = await request(app)
        .get('/api/auth/user/logout')
        .expect(200);

      expect(response.body.message).toBe('Logout Successful');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    let authCookie;

    beforeEach(async () => {
      // Register and login to get auth cookie
      await request(app)
        .post('/api/auth/user/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Test@123'
        });

      const loginResponse = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123'
        });

      authCookie = loginResponse.headers['set-cookie'];
    });

    test('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('PUT /api/auth/password', () => {
    let authCookie;

    beforeEach(async () => {
      // Register and login
      await request(app)
        .post('/api/auth/user/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Test@123'
        });

      const loginResponse = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123'
        });

      authCookie = loginResponse.headers['set-cookie'];
    });

    test('should update password with valid data', async () => {
      const response = await request(app)
        .put('/api/auth/password')
        .set('Cookie', authCookie)
        .send({
          currentPassword: 'Test@123',
          newPassword: 'NewTest@456'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password updated successfully');

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'test@example.com',
          password: 'NewTest@456'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    test('should reject password update with incorrect current password', async () => {
      const response = await request(app)
        .put('/api/auth/password')
        .set('Cookie', authCookie)
        .send({
          currentPassword: 'WrongPassword@123',
          newPassword: 'NewTest@456'
        })
        .expect(400);

      expect(response.body.message).toContain('Current password is incorrect');
    });

    test('should reject password update with weak new password', async () => {
      const response = await request(app)
        .put('/api/auth/password')
        .set('Cookie', authCookie)
        .send({
          currentPassword: 'Test@123',
          newPassword: 'weak'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
