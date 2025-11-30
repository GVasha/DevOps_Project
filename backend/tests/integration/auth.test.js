/**
 * Integration tests for authentication routes
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../server');
const UserService = require('../../services/UserService');

describe('Auth Routes Integration', () => {
  const testFilePath = path.join(__dirname, '../../data/users.json');
  let originalData;
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Backup original data
    if (fs.existsSync(testFilePath)) {
      originalData = fs.readFileSync(testFilePath, 'utf8');
    }
    fs.writeFileSync(testFilePath, JSON.stringify([]));
  });

  afterAll(() => {
    // Restore original data
    if (originalData) {
      fs.writeFileSync(testFilePath, originalData);
    }
  });

  describe('POST /api/auth/register', () => {
    test('should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration@test.com',
          password: 'Test123!@#',
          name: 'Integration Test User',
          phone: '1234567890'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe('integration@test.com');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
      
      testUser = response.body.user;
      authToken = response.body.token;
    });

    test('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test123!@#',
          name: 'Test User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'weak@test.com',
          password: 'weak',
          name: 'Test User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration@test.com',
          password: 'Test123!@#',
          name: 'Duplicate User'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'Test123!@#'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('integration@test.com');
      expect(response.body.user.password).toBeUndefined();
    });

    test('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Test123!@#'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/auth/profile', () => {
    test('should get profile with valid token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'Test123!@#'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('integration@test.com');
      expect(response.body.user.password).toBeUndefined();
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    test('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/auth/profile', () => {
    test('should update profile successfully', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'Test123!@#'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          phone: '9876543210'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.name).toBe('Updated Name');
      expect(response.body.user.phone).toBe('9876543210');
    });

    test('should return 400 for invalid phone', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'Test123!@#'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          phone: 'invalid'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/auth/account', () => {
    test('should delete account successfully', async () => {
      // Create a user to delete
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'delete@test.com',
          password: 'Test123!@#',
          name: 'Delete Test User'
        });

      const token = registerResponse.body.token;

      const response = await request(app)
        .delete('/api/auth/account')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Account deleted successfully');

      // Verify user cannot login after deletion
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'delete@test.com',
          password: 'Test123!@#'
        });

      expect(loginResponse.status).toBe(401);
    });
  });
});

