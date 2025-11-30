/**
 * File path and manipulation utilities
 */

const path = require('path');
const fs = require('fs');
const { MIME_TYPES } = require('../config/constants');

/**
 * Gets MIME type from file extension
 */
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'image/jpeg';
};

/**
 * Constructs upload directory path
 */
const getUploadDir = () => {
  return path.join(__dirname, '../uploads');
};

/**
 * Constructs file path from filename
 */
const getFilePath = (filename) => {
  return path.join(getUploadDir(), filename);
};

/**
 * Extracts filename from URL
 */
const extractFilenameFromUrl = (url) => {
  return url.replace('/uploads/', '');
};

/**
 * Ensures directory exists, creates if it doesn't
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

module.exports = {
  getMimeType,
  getUploadDir,
  getFilePath,
  extractFilenameFromUrl,
  ensureDirectoryExists
};

