require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const practiceHistoryModel = require('../models/practiceHistory.model');
const phraseModel = require('../models/phrase.model');
const userModel = require('../models/user.model');

// Increase timeout for integration tests
jest.setTimeout(30000);

describe('Practice History Endpoints', () => {
  let userCookie;
  let userId;
  let phraseId;

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

    // Create test user
    const userResponse = await request(app)
      .post('/api/auth/user/register')
      .send({
        fullName: 'Test User',
        email: 'practiceuser@example.com',
        password: 'Test@123'
      });
    
    userId = userResponse.body.user._id;
    userCookie = userResponse.headers['set-cookie'];

    // Create test phrase
    const phrase = await phraseModel.create({
      text: 'Test phrase for practice',
      language: 'English',
      level: 'beginner',
      createdBy: userId
    });
    phraseId = phrase._id.toString();
  });

  afterEach(async () => {
    await practiceHistoryModel.deleteMany({});
  });

  afterAll(async () => {
    await practiceHistoryModel.deleteMany({});
    await phraseModel.deleteMany({});
    await userModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/practice-history/save', () => {
    test('should save practice result with valid data', async () => {
      const practiceData = {
        phraseId: phraseId,
        score: 85,
        accuracy: 90,
        fluency: 85,
        pronunciation: 80,
        wordAnalysis: [
          {
            word: 'test',
            spokenWord: 'test',
            score: 100,
            feedback: 'Perfect!',
            matched: true
          }
        ],
        duration: 15
      };

      const response = await request(app)
        .post('/api/practice-history/save')
        .set('Cookie', userCookie)
        .send(practiceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.practiceHistory).toHaveProperty('score', 85);
      expect(response.body.practiceHistory).toHaveProperty('phraseId');
    });

    test('should reject practice result without authentication', async () => {
      const practiceData = {
        phraseId: phraseId,
        score: 85
      };

      const response = await request(app)
        .post('/api/practice-history/save')
        .send(practiceData)
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    test('should reject practice result with invalid phrase ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const practiceData = {
        phraseId: fakeId.toString(),
        score: 85
      };

      const response = await request(app)
        .post('/api/practice-history/save')
        .set('Cookie', userCookie)
        .send(practiceData)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    test('should reject practice result with invalid score', async () => {
      const practiceData = {
        phraseId: phraseId,
        score: 150 // Invalid: > 100
      };

      const response = await request(app)
        .post('/api/practice-history/save')
        .set('Cookie', userCookie)
        .send(practiceData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/practice-history/user', () => {
    beforeEach(async () => {
      // Create some practice history
      await practiceHistoryModel.create([
        {
          userId: userId,
          phraseId: phraseId,
          score: 85,
          accuracy: 90,
          fluency: 85,
          pronunciation: 80,
          duration: 15
        },
        {
          userId: userId,
          phraseId: phraseId,
          score: 90,
          accuracy: 95,
          fluency: 90,
          pronunciation: 85,
          duration: 12
        }
      ]);
    });

    test('should get user practice history', async () => {
      const response = await request(app)
        .get('/api/practice-history/user')
        .set('Cookie', userCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.history).toHaveLength(2);
      expect(response.body.history[0]).toHaveProperty('score');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/practice-history/user')
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/practice-history/stats', () => {
    beforeEach(async () => {
      // Create practice history for stats
      await practiceHistoryModel.create([
        {
          userId: userId,
          phraseId: phraseId,
          score: 85,
          accuracy: 90,
          fluency: 85,
          pronunciation: 80,
          duration: 15
        },
        {
          userId: userId,
          phraseId: phraseId,
          score: 90,
          accuracy: 95,
          fluency: 90,
          pronunciation: 85,
          duration: 12
        },
        {
          userId: userId,
          phraseId: phraseId,
          score: 95,
          accuracy: 98,
          fluency: 95,
          pronunciation: 92,
          duration: 10
        }
      ]);
    });

    test('should get user statistics', async () => {
      const response = await request(app)
        .get('/api/practice-history/stats')
        .set('Cookie', userCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toHaveProperty('totalPractices', 3);
      expect(response.body.stats).toHaveProperty('averageScore');
      expect(response.body.stats.averageScore).toBeGreaterThan(0);
    });

    test('should return zero stats for new user', async () => {
      // Create new user with no practice history
      const newUserResponse = await request(app)
        .post('/api/auth/user/register')
        .send({
          fullName: 'New User',
          email: 'newuser@example.com',
          password: 'Test@123'
        });

      const newUserCookie = newUserResponse.headers['set-cookie'];

      const response = await request(app)
        .get('/api/practice-history/stats')
        .set('Cookie', newUserCookie)
        .expect(200);

      expect(response.body.stats.totalPractices).toBe(0);
    });
  });

  describe('GET /api/practice-history/phrase/:phraseId', () => {
    beforeEach(async () => {
      await practiceHistoryModel.create({
        userId: userId,
        phraseId: phraseId,
        score: 85,
        accuracy: 90,
        fluency: 85,
        pronunciation: 80,
        duration: 15
      });
    });

    test('should get practice history for specific phrase', async () => {
      const response = await request(app)
        .get(`/api/practice-history/phrase/${phraseId}`)
        .set('Cookie', userCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.history).toHaveLength(1);
      expect(response.body.history[0].phraseId.toString()).toBe(phraseId);
    });

    test('should return empty array for phrase with no history', async () => {
      const newPhrase = await phraseModel.create({
        text: 'New phrase',
        language: 'English',
        level: 'beginner',
        createdBy: userId
      });

      const response = await request(app)
        .get(`/api/practice-history/phrase/${newPhrase._id}`)
        .set('Cookie', userCookie)
        .expect(200);

      expect(response.body.history).toHaveLength(0);
    });
  });
});
