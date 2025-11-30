/**
 * Assessment routes
 * Refactored to use service layer and remove duplication
 */

const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../utils/validationHelper');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { USER, UPLOAD } = require('../config/constants');
const assessmentService = require('../services/AssessmentService');
const claimService = require('../services/ClaimService');
const aiService = require('../services/aiService');

const router = express.Router();

// Configure multer for memory storage (no file saving)
const memoryStorage = multer.memoryStorage();

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

// Configure multer with memory storage
const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || UPLOAD.MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: fileFilter
});

// Wrapper to handle multer errors
const uploadSingle = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const errorMessages = {
        'LIMIT_FILE_SIZE': `File too large. Maximum size is ${UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        'LIMIT_FILE_COUNT': 'Too many files. Only one image allowed per request.',
        'LIMIT_UNEXPECTED_FILE': 'Unexpected field name for file upload. Use "image" as the field name.'
      };
      
      const message = errorMessages[err.code] || err.message;
      return errorResponse(res, 400, message);
    }
    
    if (err && err.message && err.message.includes('Only image files are allowed')) {
      return errorResponse(res, 400, err.message);
    }

    if (err) {
      return errorResponse(res, 400, err.message || 'File upload error');
    }

    next();
  });
};

// Create new damage assessment
router.post('/analyze', authenticateToken, uploadSingle, async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return errorResponse(res, 400, 'No image file provided');
    }

    // Validate description and location (after multer processes the form data)
    const description = req.body.description ? String(req.body.description).trim() : '';
    const location = req.body.location ? String(req.body.location).trim() : '';

    // Manual validation for FormData fields
    if (description && description.length > USER.DESCRIPTION_MAX_LENGTH) {
      return errorResponse(res, 400, `Description must not exceed ${USER.DESCRIPTION_MAX_LENGTH} characters`);
    }

    if (location && location.length > USER.LOCATION_MAX_LENGTH) {
      return errorResponse(res, 400, `Location must not exceed ${USER.LOCATION_MAX_LENGTH} characters`);
    }

    // Perform AI analysis with buffer
    const aiResult = await aiService.analyzeCarDamageFromBuffer(
      req.file.buffer,
      req.file.mimetype
    );

    // Create assessment record (no imageUrl or imagePath needed)
    const assessment = assessmentService.createAssessment(
      req.user.id,
      description,
      location,
      aiResult
    );

    if (!assessment) {
      return errorResponse(res, 500, 'Failed to save assessment');
    }

    return successResponse(res, 201, 'Damage assessment completed successfully', {
      assessment
    });

  } catch (error) {
    console.error('Assessment analysis error:', error);
    return errorResponse(res, 500, 'Failed to analyze damage', error.message);
  }
});

// Get all assessments for current user
router.get('/my-assessments', authenticateToken, (req, res) => {
  try {
    const assessments = assessmentService.getUserAssessments(req.user.id);
    return successResponse(res, 200, null, {
      assessments,
      total: assessments.length
    });

  } catch (error) {
    console.error('Get assessments error:', error);
    return errorResponse(res, 500, 'Failed to retrieve assessments');
  }
});

// Get specific assessment by ID
router.get('/assessment/:id', authenticateToken, (req, res) => {
  try {
    const assessment = assessmentService.getAssessmentById(req.params.id);

    if (!assessment) {
      return errorResponse(res, 404, 'Assessment not found');
    }

    if (!assessmentService.verifyOwnership(assessment, req.user.id)) {
      return errorResponse(res, 403, 'Access denied to this assessment');
    }

    return successResponse(res, 200, null, { assessment });

  } catch (error) {
    console.error('Get assessment error:', error);
    return errorResponse(res, 500, 'Failed to retrieve assessment');
  }
});

// Create insurance claim from assessment
router.post('/create-claim', authenticateToken, [
  body('assessmentId').notEmpty().withMessage('Assessment ID is required'),
  body('claimType').isIn(['collision', 'comprehensive', 'liability']).withMessage('Invalid claim type'),
  body('incidentDate').isISO8601().withMessage('Valid incident date is required'),
  body('incidentDescription')
    .isLength({ min: USER.INCIDENT_DESCRIPTION_MIN_LENGTH, max: USER.INCIDENT_DESCRIPTION_MAX_LENGTH })
    .withMessage(`Incident description must be between ${USER.INCIDENT_DESCRIPTION_MIN_LENGTH} and ${USER.INCIDENT_DESCRIPTION_MAX_LENGTH} characters`),
  body('policyNumber')
    .optional()
    .isLength({ min: USER.POLICY_NUMBER_MIN_LENGTH, max: USER.POLICY_NUMBER_MAX_LENGTH })
    .withMessage(`Policy number must be between ${USER.POLICY_NUMBER_MIN_LENGTH} and ${USER.POLICY_NUMBER_MAX_LENGTH} characters`)
], (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { assessmentId, claimType, incidentDate, incidentDescription, policyNumber } = req.body;

    // Verify assessment exists and belongs to user
    const assessment = assessmentService.getAssessmentById(assessmentId);
    if (!assessment) {
      return errorResponse(res, 404, 'Assessment not found');
    }

    if (!assessmentService.verifyOwnership(assessment, req.user.id)) {
      return errorResponse(res, 403, 'Access denied to this assessment');
    }

    // Create claim record
    const claim = claimService.createClaim(
      req.user.id,
      assessmentId,
      { claimType, incidentDate, incidentDescription, policyNumber },
      assessment
    );

    if (!claim) {
      return errorResponse(res, 500, 'Failed to create claim');
    }

    return successResponse(res, 201, 'Insurance claim created successfully', {
      claim
    });

  } catch (error) {
    console.error('Create claim error:', error);
    return errorResponse(res, 500, 'Failed to create claim', error.message);
  }
});

// Get all claims for current user
router.get('/my-claims', authenticateToken, (req, res) => {
  try {
    const claims = claimService.getUserClaims(req.user.id);
    return successResponse(res, 200, null, {
      claims,
      total: claims.length
    });

  } catch (error) {
    console.error('Get claims error:', error);
    return errorResponse(res, 500, 'Failed to retrieve claims');
  }
});

// Get specific claim by ID
router.get('/claim/:id', authenticateToken, (req, res) => {
  try {
    const claim = claimService.getClaimById(req.params.id);

    if (!claim) {
      return errorResponse(res, 404, 'Claim not found');
    }

    if (!claimService.verifyOwnership(claim, req.user.id)) {
      return errorResponse(res, 403, 'Access denied to this claim');
    }

    const assessment = assessmentService.getAssessmentById(claim.assessmentId);

    return successResponse(res, 200, null, {
      claim,
      assessment
    });

  } catch (error) {
    console.error('Get claim error:', error);
    return errorResponse(res, 500, 'Failed to retrieve claim');
  }
});

module.exports = router;
