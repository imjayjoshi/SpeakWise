const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const userModel = require('../models/user.model');

jest.setTimeout(30000);

describe('Admin Endpoints', () => {
  let adminCookie;
  let userCookie;

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

    // Create admin user
    const adminRes = await request(app)
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

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/admin/users', () => {
    it('should allow admin to get all users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', userCookie)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app)
        .get('/api/admin/users')
        .expect(401);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should allow admin to get user by ID', async () => {
      const users = await userModel.find({ email: 'user@example.com' });
      const userId = users[0]._id;

      const response = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('user@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/admin/users/${fakeId}`)
        .set('Cookie', adminCookie)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should allow admin to delete user', async () => {
      const users = await userModel.find({ email: 'user@example.com' });
      const userId = users[0]._id;

      const response = await request(app)
        .delete(`/api/admin/users/${userId}`)
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify user is deleted
      const deletedUser = await userModel.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should prevent admin from deleting themselves', async () => {
      const admins = await userModel.find({ email: 'admin@gmail.com' });
      const adminId = admins[0]._id;

      const response = await request(app)
        .delete(`/api/admin/users/${adminId}`)
        .set('Cookie', adminCookie)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/stats', () => {
    it('should return admin statistics', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
    });

    it('should reject non-admin access to stats', async () => {
      await request(app)
        .get('/api/admin/stats')
        .set('Cookie', userCookie)
        .expect(403);
    });
  });
});
