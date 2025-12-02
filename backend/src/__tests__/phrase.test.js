require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const phraseModel = require('../models/phrase.model');
const userModel = require('../models/user.model');

// Increase timeout for integration tests
jest.setTimeout(30000);

describe('Phrase Endpoints', () => {
  let adminCookie;
  let userCookie;
  let adminUser;
  let regularUser;

  beforeAll(async () => {
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

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/auth/user/register')
      .send({
        fullName: 'Admin User',
        email: 'admin@gmail.com',
        password: 'Admin@123'
      });
    
    adminUser = adminResponse.body.user;
    adminCookie = adminResponse.headers['set-cookie'];

    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/user/register')
      .send({
        fullName: 'Regular User',
        email: 'user@example.com',
        password: 'User@123'
      });
    
    regularUser = userResponse.body.user;
    userCookie = userResponse.headers['set-cookie'];
  });

  afterEach(async () => {
    await phraseModel.deleteMany({});
  });

  afterAll(async () => {
    await phraseModel.deleteMany({});
    await userModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/phrase/add', () => {
    test('should allow admin to create phrase', async () => {
      const phraseData = {
        text: 'Hello, how are you?',
        meaning: 'A common greeting',
        example: 'Hello, how are you doing today?',
        language: 'English',
        level: 'beginner'
      };

      const response = await request(app)
        .post('/api/phrase/add')
        .set('Cookie', adminCookie)
        .send(phraseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.phrase).toHaveProperty('text', phraseData.text);
      expect(response.body.phrase).toHaveProperty('level', phraseData.level);
    });

    test('should reject non-admin user from creating phrase', async () => {
      const phraseData = {
        text: 'Test phrase',
        language: 'English',
        level: 'beginner'
      };

      const response = await request(app)
        .post('/api/phrase/add')
        .set('Cookie', userCookie)
        .send(phraseData)
        .expect(403);

      expect(response.body.message).toContain('Admin access required');
    });

    test('should reject phrase without required fields', async () => {
      const phraseData = {
        text: 'Test phrase'
        // Missing language and level
      };

      const response = await request(app)
        .post('/api/phrase/add')
        .set('Cookie', adminCookie)
        .send(phraseData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/phrase/level/:level', () => {
    beforeEach(async () => {
      // Create test phrases
      await phraseModel.create([
        {
          text: 'Beginner phrase 1',
          language: 'English',
          level: 'beginner',
          createdBy: adminUser._id
        },
        {
          text: 'Beginner phrase 2',
          language: 'English',
          level: 'beginner',
          createdBy: adminUser._id
        },
        {
          text: 'Intermediate phrase',
          language: 'English',
          level: 'intermediate',
          createdBy: adminUser._id
        }
      ]);
    });

    test('should get phrases by level', async () => {
      const response = await request(app)
        .get('/api/phrase/level/beginner')
        .set('Cookie', userCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.phrases).toHaveLength(2);
      expect(response.body.phrases[0].level).toBe('beginner');
    });

    test('should return empty array for level with no phrases', async () => {
      const response = await request(app)
        .get('/api/phrase/level/expert')
        .set('Cookie', userCookie)
        .expect(200);

      expect(response.body.phrases).toHaveLength(0);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/phrase/level/beginner')
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/phrase/:id', () => {
    let phraseId;

    beforeEach(async () => {
      const phrase = await phraseModel.create({
        text: 'Test phrase',
        language: 'English',
        level: 'beginner',
        createdBy: adminUser._id
      });
      phraseId = phrase._id.toString();
    });

    test('should get phrase by ID', async () => {
      const response = await request(app)
        .get(`/api/phrase/${phraseId}`)
        .set('Cookie', userCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.phrase).toHaveProperty('text', 'Test phrase');
    });

    test('should return 404 for non-existent phrase', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/phrase/${fakeId}`)
        .set('Cookie', userCookie)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/phrase/:id', () => {
    let phraseId;

    beforeEach(async () => {
      const phrase = await phraseModel.create({
        text: 'Original text',
        language: 'English',
        level: 'beginner',
        createdBy: adminUser._id
      });
      phraseId = phrase._id.toString();
    });

    test('should allow admin to update phrase', async () => {
      const updateData = {
        text: 'Updated text',
        meaning: 'Updated meaning'
      };

      const response = await request(app)
        .put(`/api/phrase/${phraseId}`)
        .set('Cookie', adminCookie)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.phrase.text).toBe('Updated text');
      expect(response.body.phrase.meaning).toBe('Updated meaning');
    });

    test('should reject non-admin user from updating phrase', async () => {
      const response = await request(app)
        .put(`/api/phrase/${phraseId}`)
        .set('Cookie', userCookie)
        .send({ text: 'Updated' })
        .expect(403);

      expect(response.body.message).toContain('Admin access required');
    });
  });

  describe('DELETE /api/phrase/:id', () => {
    let phraseId;

    beforeEach(async () => {
      const phrase = await phraseModel.create({
        text: 'To be deleted',
        language: 'English',
        level: 'beginner',
        createdBy: adminUser._id
      });
      phraseId = phrase._id.toString();
    });

    test('should allow admin to delete phrase', async () => {
      const response = await request(app)
        .delete(`/api/phrase/${phraseId}`)
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify phrase is deleted
      const phrase = await phraseModel.findById(phraseId);
      expect(phrase).toBeNull();
    });

    test('should reject non-admin user from deleting phrase', async () => {
      const response = await request(app)
        .delete(`/api/phrase/${phraseId}`)
        .set('Cookie', userCookie)
        .expect(403);

      expect(response.body.message).toContain('Admin access required');

      // Verify phrase still exists
      const phrase = await phraseModel.findById(phraseId);
      expect(phrase).not.toBeNull();
    });
  });

  describe('GET /api/phrase/all', () => {
    beforeEach(async () => {
      await phraseModel.create([
        { text: 'Phrase 1', language: 'English', level: 'beginner', createdBy: adminUser._id },
        { text: 'Phrase 2', language: 'Japanese', level: 'intermediate', createdBy: adminUser._id },
        { text: 'Phrase 3', language: 'English', level: 'expert', createdBy: adminUser._id }
      ]);
    });

    test('should allow admin to get all phrases', async () => {
      const response = await request(app)
        .get('/api/phrase/all')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.phrases).toHaveLength(3);
    });

    test('should reject non-admin user from getting all phrases', async () => {
      const response = await request(app)
        .get('/api/phrase/all')
        .set('Cookie', userCookie)
        .expect(403);

      expect(response.body.message).toContain('Admin access required');
    });
  });
});
