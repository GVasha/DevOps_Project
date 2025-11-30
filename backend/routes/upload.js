/**
 * File upload routes
 * Refactored to remove duplication and use constants
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { getUploadDir, ensureDirectoryExists } = require('../utils/fileHelper');
const { UPLOAD } = require('../config/constants');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadDir();
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const extname = UPLOAD.ALLOWED_IMAGE_TYPES.some(type => 
    file.originalname.toLowerCase().endsWith(`.${type}`)
  );
  const mimetype = UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`Only image files are allowed (${UPLOAD.ALLOWED_IMAGE_TYPES.join(', ')})`));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || UPLOAD.MAX_FILE_SIZE,
    files: UPLOAD.MAX_FILES_PER_REQUEST
  },
  fileFilter: fileFilter
});

/**
 * Creates file info object
 */
const createFileInfo = (file, userId) => ({
  id: uuidv4(),
  originalName: file.originalname,
  filename: file.filename,
  path: file.path,
  size: file.size,
  mimetype: file.mimetype,
  uploadedBy: userId,
  uploadedAt: new Date().toISOString(),
  url: `/uploads/${file.filename}`
});

// Upload single image
router.post('/single', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'No image file provided');
    }

    const fileInfo = createFileInfo(req.file, req.user.id);
    return successResponse(res, 201, 'Image uploaded successfully', {
      file: fileInfo
    });

  } catch (error) {
    console.error('Single upload error:', error);
    return errorResponse(res, 500, 'Failed to upload image');
  }
});

// Upload multiple images
router.post('/multiple', authenticateToken, upload.array('images', UPLOAD.MAX_FILES_PER_REQUEST), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 400, 'No image files provided');
    }

    const filesInfo = req.files.map(file => createFileInfo(file, req.user.id));
    return successResponse(res, 201, `${req.files.length} images uploaded successfully`, {
      files: filesInfo
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    return errorResponse(res, 500, 'Failed to upload images');
  }
});

// Get uploaded file info
router.get('/file/:filename', authenticateToken, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(getUploadDir(), filename);

    if (!fs.existsSync(filePath)) {
      return errorResponse(res, 404, 'File not found');
    }

    const stats = fs.statSync(filePath);
    return successResponse(res, 200, null, {
      filename: filename,
      size: stats.size,
      uploadedAt: stats.birthtime,
      url: `/uploads/${filename}`
    });

  } catch (error) {
    console.error('File info error:', error);
    return errorResponse(res, 500, 'Failed to get file information');
  }
});

// Delete uploaded file
router.delete('/file/:filename', authenticateToken, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(getUploadDir(), filename);

    if (!fs.existsSync(filePath)) {
      return errorResponse(res, 404, 'File not found');
    }

    fs.unlinkSync(filePath);
    return successResponse(res, 200, 'File deleted successfully', {
      filename: filename
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return errorResponse(res, 500, 'Failed to delete file');
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const errorMessages = {
      'LIMIT_FILE_SIZE': `File too large. Maximum size is ${UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
      'LIMIT_FILE_COUNT': `Too many files. Maximum is ${UPLOAD.MAX_FILES_PER_REQUEST} files per request.`,
      'LIMIT_UNEXPECTED_FILE': 'Unexpected field name for file upload.'
    };
    
    const message = errorMessages[error.code] || error.message;
    return errorResponse(res, 400, message);
  }
  
  if (error.message && error.message.includes('Only image files are allowed')) {
    return errorResponse(res, 400, error.message);
  }

  next(error);
});

module.exports = router;
