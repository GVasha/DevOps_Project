/**
 * Application constants and configuration values
 */

module.exports = {
  // Server Configuration
  SERVER: {
    DEFAULT_PORT: 5000,
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
    JSON_BODY_LIMIT: '10mb',
    URL_ENCODED_LIMIT: '10mb'
  },

  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES_PER_REQUEST: 5,
    ALLOWED_IMAGE_TYPES: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },

  // AI Analysis Configuration
  AI: {
    OPENAI_MODEL: 'gpt-4o',
    OPENAI_MAX_TOKENS: 500,
    OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
    FILE_SIZE_THRESHOLD_MODERATE: 2 * 1024 * 1024, // 2MB
    FILE_SIZE_THRESHOLD_SEVERE: 5 * 1024 * 1024, // 5MB
    CONFIDENCE_MIN: 0,
    CONFIDENCE_MAX: 10
  },

  // Damage Assessment Constants
  DAMAGE: {
    SEVERITY_LEVELS: ['None', 'Minor', 'Moderate', 'Severe', 'Total Loss', 'Unknown'],
    COST_CATEGORIES: ['None', 'Low', 'Medium', 'High', 'Very High', 'Unknown'],
    COST_RANGES: {
      'Low': '$0-500',
      'Medium': '$500-2000',
      'High': '$2000-5000',
      'Very High': '$5000+'
    }
  },

  // Claim Configuration
  CLAIM: {
    TYPES: ['collision', 'comprehensive', 'liability'],
    STATUSES: ['submitted', 'in_progress', 'approved', 'rejected', 'completed'],
    PRIORITY_LEVELS: ['Low', 'Medium', 'High']
  },

  // User Validation
  USER: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_SALT_ROUNDS: 12,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 500,
    LOCATION_MAX_LENGTH: 100,
    INCIDENT_DESCRIPTION_MIN_LENGTH: 10,
    INCIDENT_DESCRIPTION_MAX_LENGTH: 1000,
    POLICY_NUMBER_MIN_LENGTH: 5,
    POLICY_NUMBER_MAX_LENGTH: 50
  },

  // JWT Configuration
  JWT: {
    EXPIRES_IN: '24h'
  },

  // MIME Types Mapping
  MIME_TYPES: {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  },

  // Assessment Status
  ASSESSMENT: {
    STATUSES: ['pending', 'completed', 'failed']
  }
};

