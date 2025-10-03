const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const FileStorage = require('../utils/fileStorage');
const aiService = require('../services/aiService');

const router = express.Router();
const assessmentStorage = new FileStorage('assessments.json');
const claimStorage = new FileStorage('claims.json');

// Create new damage assessment
router.post('/analyze', authenticateToken, [
  body('imageUrl').notEmpty().withMessage('Image URL is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location must not exceed 100 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { imageUrl, description, location } = req.body;

    // Extract filename from URL and construct file path
    const filename = imageUrl.replace('/uploads/', '');
    const imagePath = path.join(__dirname, '../uploads', filename);

    // Verify file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        error: 'Image file not found'
      });
    }

    // Perform AI analysis
    const aiResult = await aiService.analyzeCarDamage(imagePath);

    // Create assessment record
    const assessment = {
      id: uuidv4(),
      userId: req.user.id,
      imageUrl: imageUrl,
      imagePath: imagePath,
      description: description || '',
      location: location || '',
      aiAnalysis: aiResult,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save assessment
    const saved = assessmentStorage.append(assessment);
    if (!saved) {
      return res.status(500).json({
        error: 'Failed to save assessment'
      });
    }

    res.status(201).json({
      message: 'Damage assessment completed successfully',
      assessment: assessment
    });

  } catch (error) {
    console.error('Assessment analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze damage',
      details: error.message
    });
  }
});

// Get all assessments for current user
router.get('/my-assessments', authenticateToken, (req, res) => {
  try {
    const allAssessments = assessmentStorage.read();
    const userAssessments = allAssessments.filter(assessment => 
      assessment.userId === req.user.id
    );

    // Sort by creation date (newest first)
    userAssessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      assessments: userAssessments,
      total: userAssessments.length
    });

  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      error: 'Failed to retrieve assessments'
    });
  }
});

// Get specific assessment by ID
router.get('/assessment/:id', authenticateToken, (req, res) => {
  try {
    const assessmentId = req.params.id;
    const assessment = assessmentStorage.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found'
      });
    }

    // Check if user owns this assessment
    if (assessment.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied to this assessment'
      });
    }

    res.json({
      assessment: assessment
    });

  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      error: 'Failed to retrieve assessment'
    });
  }
});

// Create insurance claim from assessment
router.post('/create-claim', authenticateToken, [
  body('assessmentId').notEmpty().withMessage('Assessment ID is required'),
  body('claimType').isIn(['collision', 'comprehensive', 'liability']).withMessage('Invalid claim type'),
  body('incidentDate').isISO8601().withMessage('Valid incident date is required'),
  body('incidentDescription').isLength({ min: 10, max: 1000 }).withMessage('Incident description must be between 10 and 1000 characters'),
  body('policyNumber').optional().isLength({ min: 5, max: 50 }).withMessage('Policy number must be between 5 and 50 characters')
], (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      assessmentId, 
      claimType, 
      incidentDate, 
      incidentDescription, 
      policyNumber 
    } = req.body;

    // Verify assessment exists and belongs to user
    const assessment = assessmentStorage.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found'
      });
    }

    if (assessment.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied to this assessment'
      });
    }

    // Create claim record
    const claim = {
      id: uuidv4(),
      claimNumber: `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      userId: req.user.id,
      assessmentId: assessmentId,
      claimType: claimType,
      incidentDate: incidentDate,
      incidentDescription: incidentDescription,
      policyNumber: policyNumber || null,
      status: 'submitted',
      estimatedCost: calculateEstimatedCost(assessment.aiAnalysis),
      priority: calculatePriority(assessment.aiAnalysis),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save claim
    const saved = claimStorage.append(claim);
    if (!saved) {
      return res.status(500).json({
        error: 'Failed to create claim'
      });
    }

    res.status(201).json({
      message: 'Insurance claim created successfully',
      claim: claim
    });

  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({
      error: 'Failed to create claim',
      details: error.message
    });
  }
});

// Get all claims for current user
router.get('/my-claims', authenticateToken, (req, res) => {
  try {
    const allClaims = claimStorage.read();
    const userClaims = allClaims.filter(claim => 
      claim.userId === req.user.id
    );

    // Sort by creation date (newest first)
    userClaims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      claims: userClaims,
      total: userClaims.length
    });

  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({
      error: 'Failed to retrieve claims'
    });
  }
});

// Get specific claim by ID
router.get('/claim/:id', authenticateToken, (req, res) => {
  try {
    const claimId = req.params.id;
    const claim = claimStorage.findById(claimId);

    if (!claim) {
      return res.status(404).json({
        error: 'Claim not found'
      });
    }

    // Check if user owns this claim
    if (claim.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied to this claim'
      });
    }

    // Get associated assessment
    const assessment = assessmentStorage.findById(claim.assessmentId);

    res.json({
      claim: claim,
      assessment: assessment
    });

  } catch (error) {
    console.error('Get claim error:', error);
    res.status(500).json({
      error: 'Failed to retrieve claim'
    });
  }
});

// Helper function to calculate estimated cost based on AI analysis
function calculateEstimatedCost(aiAnalysis) {
  if (!aiAnalysis || !aiAnalysis.analysis) {
    return 'Unknown';
  }

  const severity = aiAnalysis.analysis.severity;
  const costCategory = aiAnalysis.analysis.costCategory;

  if (costCategory) {
    return costCategory;
  }

  // Fallback based on severity
  switch (severity) {
    case 'None':
      return 'Low';
    case 'Minor':
      return 'Low';
    case 'Moderate':
      return 'Medium';
    case 'Severe':
      return 'High';
    case 'Total Loss':
      return 'Very High';
    default:
      return 'Unknown';
  }
}

// Helper function to calculate priority based on AI analysis
function calculatePriority(aiAnalysis) {
  if (!aiAnalysis || !aiAnalysis.analysis) {
    return 'Medium';
  }

  const severity = aiAnalysis.analysis.severity;
  const safetyConcerns = aiAnalysis.analysis.safetyConcerns;

  if (safetyConcerns && safetyConcerns.toLowerCase().includes('safety')) {
    return 'High';
  }

  switch (severity) {
    case 'None':
      return 'Low';
    case 'Minor':
      return 'Low';
    case 'Moderate':
      return 'Medium';
    case 'Severe':
      return 'High';
    case 'Total Loss':
      return 'High';
    default:
      return 'Medium';
  }
}

module.exports = router;
