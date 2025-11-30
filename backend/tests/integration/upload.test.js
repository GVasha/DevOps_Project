/**
 * Integration tests for upload routes
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../server');
const UserService = require('../../services/UserService');

describe('Upload Routes Integration', () => {
  let authToken;
  let testUserId;
  const testFilePath = path.join(__dirname, '../../data/users.json');
  let originalData;

  beforeAll(async () => {
    // Backup and reset data
    if (fs.existsSync(testFilePath)) {
      originalData = fs.readFileSync(testFilePath, 'utf8');
    }
    fs.writeFileSync(testFilePath, JSON.stringify([]));

    // Create test user and get token
    const testUser = await UserService.createUser(
      'uploadtest@test.com',
      'Test123!@#',
      'Upload Test User'
    );
    testUserId = testUser.id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'uploadtest@test.com',
        password: 'Test123!@#'
      });
    authToken = loginResponse.body.token;
  });

  afterAll(() => {
    // Clean up test files
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        if (file.startsWith('test-')) {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      });
    }

    // Restore original data
    if (originalData) {
      fs.writeFileSync(testFilePath, originalData);
    }
  });

  describe('POST /api/upload/single', () => {
    test('should upload single image successfully', async () => {
      // Create a mock image file
      const testImagePath = path.join(__dirname, '../../uploads/test-image.jpg');
      const testImageBuffer = Buffer.from('fake image data');
      fs.writeFileSync(testImagePath, testImageBuffer);

      const response = await request(app)
        .post('/api/upload/single')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Image uploaded successfully');
      expect(response.body.file).toBeDefined();
      expect(response.body.file.filename).toBeDefined();
      expect(response.body.file.url).toContain('/uploads/');
      expect(response.body.file.uploadedBy).toBe(testUserId);

      // Clean up
      if (fs.existsSync(response.body.file.path)) {
        fs.unlinkSync(response.body.file.path);
      }
      fs.unlinkSync(testImagePath);
    });

    test('should reject upload without authentication', async () => {
      const response = await request(app)
        .post('/api/upload/single');

      expect(response.status).toBe(401);
    });

    test('should reject upload without file', async () => {
      const response = await request(app)
        .post('/api/upload/single')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No image file provided');
    });

    test('should reject invalid file type', async () => {
      const testFilePath = path.join(__dirname, '../../uploads/test-file.txt');
      fs.writeFileSync(testFilePath, 'not an image');

      const response = await request(app)
        .post('/api/upload/single')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testFilePath);

      expect(response.status).toBe(400);
      fs.unlinkSync(testFilePath);
    });
  });

  describe('POST /api/upload/multiple', () => {
    test('should upload multiple images successfully', async () => {
      const testImage1 = path.join(__dirname, '../../uploads/test-image1.jpg');
      const testImage2 = path.join(__dirname, '../../uploads/test-image2.jpg');
      fs.writeFileSync(testImage1, Buffer.from('fake image 1'));
      fs.writeFileSync(testImage2, Buffer.from('fake image 2'));

      const response = await request(app)
        .post('/api/upload/multiple')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('images', testImage1)
        .attach('images', testImage2);

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('2 images uploaded successfully');
      expect(response.body.files).toHaveLength(2);
      expect(response.body.files[0].uploadedBy).toBe(testUserId);

      // Clean up
      response.body.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      fs.unlinkSync(testImage1);
      fs.unlinkSync(testImage2);
    });

    test('should reject multiple upload without files', async () => {
      const response = await request(app)
        .post('/api/upload/multiple')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No image files provided');
    });
  });

  describe('GET /api/upload/file/:filename', () => {
    test('should get file info successfully', async () => {
      // First upload a file
      const testImagePath = path.join(__dirname, '../../uploads/test-info.jpg');
      fs.writeFileSync(testImagePath, Buffer.from('test image'));

      const uploadResponse = await request(app)
        .post('/api/upload/single')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath);

      const filename = uploadResponse.body.file.filename;

      const response = await request(app)
        .get(`/api/upload/file/${filename}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.filename).toBe(filename);
      expect(response.body.size).toBeDefined();
      expect(response.body.url).toContain('/uploads/');

      // Clean up
      if (fs.existsSync(uploadResponse.body.file.path)) {
        fs.unlinkSync(uploadResponse.body.file.path);
      }
      fs.unlinkSync(testImagePath);
    });

    test('should return 404 for non-existent file', async () => {
      const response = await request(app)
        .get('/api/upload/file/nonexistent.jpg')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('File not found');
    });
  });

  describe('DELETE /api/upload/file/:filename', () => {
    test('should delete file successfully', async () => {
      // First upload a file
      const testImagePath = path.join(__dirname, '../../uploads/test-delete.jpg');
      fs.writeFileSync(testImagePath, Buffer.from('test image'));

      const uploadResponse = await request(app)
        .post('/api/upload/single')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath);

      const filename = uploadResponse.body.file.filename;
      const filePath = uploadResponse.body.file.path;

      // Verify file exists
      expect(fs.existsSync(filePath)).toBe(true);

      const response = await request(app)
        .delete(`/api/upload/file/${filename}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('File deleted successfully');
      expect(fs.existsSync(filePath)).toBe(false);

      fs.unlinkSync(testImagePath);
    });

    test('should return 404 when deleting non-existent file', async () => {
      const response = await request(app)
        .delete('/api/upload/file/nonexistent.jpg')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});

