/**
 * Integration tests for assessment routes
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../server');
const UserService = require('../../services/UserService');
const AssessmentService = require('../../services/AssessmentService');

describe('Assessment Routes Integration', () => {
  const usersFilePath = path.join(__dirname, '../../data/users.json');
  const assessmentsFilePath = path.join(__dirname, '../../data/assessments.json');
  let originalUsersData;
  let originalAssessmentsData;
  let authToken;
  let userId;
  let testImagePath;

  beforeAll(async () => {
    // Backup original data
    if (fs.existsSync(usersFilePath)) {
      originalUsersData = fs.readFileSync(usersFilePath, 'utf8');
    }
    if (fs.existsSync(assessmentsFilePath)) {
      originalAssessmentsData = fs.readFileSync(assessmentsFilePath, 'utf8');
    }

    // Create test user
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
    const user = await UserService.createUser(
      'assessment@test.com',
      'Test123!@#',
      'Assessment Test User'
    );
    userId = user.id;

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'assessment@test.com',
        password: 'Test123!@#'
      });
    authToken = loginResponse.body.token;

    // Create test image file
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    testImagePath = path.join(uploadsDir, 'test-image.jpg');
    fs.writeFileSync(testImagePath, 'fake image data');
  });

  afterAll(() => {
    // Restore original data
    if (originalUsersData) {
      fs.writeFileSync(usersFilePath, originalUsersData);
    }
    if (originalAssessmentsData) {
      fs.writeFileSync(assessmentsFilePath, originalAssessmentsData);
    }
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  describe('POST /api/assessment/analyze', () => {
    test('should analyze image successfully', async () => {
      const response = await request(app)
        .post('/api/assessment/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageUrl: '/uploads/test-image.jpg',
          description: 'Test damage description',
          location: 'Test location'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Damage assessment completed successfully');
      expect(response.body.assessment).toBeDefined();
      expect(response.body.assessment.userId).toBe(userId);
      expect(response.body.assessment.aiAnalysis).toBeDefined();
    });

    test('should return 400 for missing imageUrl', async () => {
      const response = await request(app)
        .post('/api/assessment/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test description'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should return 404 for non-existent image', async () => {
      const response = await request(app)
        .post('/api/assessment/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageUrl: '/uploads/non-existent.jpg'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Image file not found');
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/assessment/analyze')
        .send({
          imageUrl: '/uploads/test-image.jpg'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/assessment/my-assessments', () => {
    test('should get user assessments', async () => {
      // Create an assessment first
      const aiAnalysis = {
        success: true,
        analysis: { severity: 'Minor' }
      };
      AssessmentService.createAssessment(
        userId,
        '/uploads/test-image.jpg',
        'Test',
        '',
        aiAnalysis
      );

      const response = await request(app)
        .get('/api/assessment/my-assessments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.assessments).toBeDefined();
      expect(Array.isArray(response.body.assessments)).toBe(true);
      expect(response.body.total).toBeGreaterThanOrEqual(0);
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/assessment/my-assessments');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/assessment/assessment/:id', () => {
    test('should get assessment by id', async () => {
      const aiAnalysis = {
        success: true,
        analysis: { severity: 'Minor' }
      };
      const assessment = AssessmentService.createAssessment(
        userId,
        '/uploads/test-image.jpg',
        'Test',
        '',
        aiAnalysis
      );

      const response = await request(app)
        .get(`/api/assessment/assessment/${assessment.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.assessment).toBeDefined();
      expect(response.body.assessment.id).toBe(assessment.id);
    });

    test('should return 404 for non-existent assessment', async () => {
      const response = await request(app)
        .get('/api/assessment/assessment/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Assessment not found');
    });
  });

  describe('POST /api/assessment/create-claim', () => {
    test('should create claim successfully', async () => {
      const aiAnalysis = {
        success: true,
        analysis: {
          severity: 'Moderate',
          costCategory: 'Medium'
        }
      };
      const assessment = AssessmentService.createAssessment(
        userId,
        '/uploads/test-image.jpg',
        'Test',
        '',
        aiAnalysis
      );

      const response = await request(app)
        .post('/api/assessment/create-claim')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assessmentId: assessment.id,
          claimType: 'collision',
          incidentDate: '2024-01-01T00:00:00.000Z',
          incidentDescription: 'Test incident description for claim creation',
          policyNumber: 'POL-12345'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Insurance claim created successfully');
      expect(response.body.claim).toBeDefined();
      expect(response.body.claim.claimType).toBe('collision');
      expect(response.body.claim.status).toBe('submitted');
    });

    test('should return 400 for invalid claim type', async () => {
      const aiAnalysis = {
        success: true,
        analysis: { severity: 'Minor' }
      };
      const assessment = AssessmentService.createAssessment(
        userId,
        '/uploads/test-image.jpg',
        'Test',
        '',
        aiAnalysis
      );

      const response = await request(app)
        .post('/api/assessment/create-claim')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assessmentId: assessment.id,
          claimType: 'invalid-type',
          incidentDate: '2024-01-01T00:00:00.000Z',
          incidentDescription: 'Test incident description'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should return 404 for non-existent assessment', async () => {
      const response = await request(app)
        .post('/api/assessment/create-claim')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assessmentId: 'non-existent-id',
          claimType: 'collision',
          incidentDate: '2024-01-01T00:00:00.000Z',
          incidentDescription: 'Test incident description'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Assessment not found');
    });
  });
});

