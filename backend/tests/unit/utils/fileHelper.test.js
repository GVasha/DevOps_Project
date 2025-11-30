/**
 * Unit tests for fileHelper utilities
 */

const path = require('path');
const { getMimeType, extractFilenameFromUrl } = require('../../../utils/fileHelper');

describe('fileHelper', () => {
  describe('getMimeType', () => {
    test('should return image/jpeg for .jpg extension', () => {
      expect(getMimeType('test.jpg')).toBe('image/jpeg');
    });

    test('should return image/jpeg for .jpeg extension', () => {
      expect(getMimeType('test.jpeg')).toBe('image/jpeg');
    });

    test('should return image/png for .png extension', () => {
      expect(getMimeType('test.png')).toBe('image/png');
    });

    test('should return image/gif for .gif extension', () => {
      expect(getMimeType('test.gif')).toBe('image/gif');
    });

    test('should return image/webp for .webp extension', () => {
      expect(getMimeType('test.webp')).toBe('image/webp');
    });

    test('should return image/jpeg as default for unknown extension', () => {
      expect(getMimeType('test.unknown')).toBe('image/jpeg');
    });

    test('should handle case insensitive extensions', () => {
      expect(getMimeType('test.JPG')).toBe('image/jpeg');
      expect(getMimeType('test.PNG')).toBe('image/png');
    });

    test('should handle full paths', () => {
      expect(getMimeType('/path/to/file.jpg')).toBe('image/jpeg');
    });
  });

  describe('extractFilenameFromUrl', () => {
    test('should extract filename from upload URL', () => {
      expect(extractFilenameFromUrl('/uploads/test.jpg')).toBe('test.jpg');
    });

    test('should handle URLs with multiple slashes', () => {
      expect(extractFilenameFromUrl('/uploads/subfolder/test.jpg')).toBe('subfolder/test.jpg');
    });

    test('should return original string if no /uploads/ prefix', () => {
      expect(extractFilenameFromUrl('test.jpg')).toBe('test.jpg');
    });

    test('should handle empty string', () => {
      expect(extractFilenameFromUrl('')).toBe('');
    });
  });
});

