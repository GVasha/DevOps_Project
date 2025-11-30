/**
 * Test setup and global mocks
 */

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = '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';

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

