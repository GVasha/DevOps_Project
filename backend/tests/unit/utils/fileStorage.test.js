/**
 * Unit tests for FileStorage class
 */

const fs = require('fs');
const path = require('path');
const FileStorage = require('../../../utils/fileStorage');

describe('FileStorage', () => {
  let storage;
  const testFileName = 'test-storage.json';
  const testFilePath = path.join(__dirname, '../../../data', testFileName);

  beforeEach(() => {
    // Clean up test file if exists
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    storage = new FileStorage(testFileName);
  });

  afterEach(() => {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  describe('constructor', () => {
    test('should create file if it does not exist', () => {
      expect(fs.existsSync(testFilePath)).toBe(true);
      const content = fs.readFileSync(testFilePath, 'utf8');
      expect(JSON.parse(content)).toEqual([]);
    });
  });

  describe('read', () => {
    test('should return empty array for new file', () => {
      expect(storage.read()).toEqual([]);
    });

    test('should return data from file', () => {
      const testData = [{ id: '1', name: 'Test' }];
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      expect(storage.read()).toEqual(testData);
    });

    test('should return empty array on read error', () => {
      // Mock fs.readFileSync to throw error
      const originalRead = fs.readFileSync;
      fs.readFileSync = jest.fn(() => {
        throw new Error('Read error');
      });
      
      expect(storage.read()).toEqual([]);
      
      fs.readFileSync = originalRead;
    });
  });

  describe('write', () => {
    test('should write data to file', () => {
      const testData = [{ id: '1', name: 'Test' }];
      const result = storage.write(testData);
      
      expect(result).toBe(true);
      const content = fs.readFileSync(testFilePath, 'utf8');
      expect(JSON.parse(content)).toEqual(testData);
    });

    test('should return false on write error', () => {
      // Mock fs.writeFileSync to throw error
      const originalWrite = fs.writeFileSync;
      fs.writeFileSync = jest.fn(() => {
        throw new Error('Write error');
      });
      
      expect(storage.write([{ id: '1' }])).toBe(false);
      
      fs.writeFileSync = originalWrite;
    });
  });

  describe('append', () => {
    test('should append item to empty storage', () => {
      const item = { id: '1', name: 'Test' };
      const result = storage.append(item);
      
      expect(result).toBe(true);
      expect(storage.read()).toHaveLength(1);
      expect(storage.read()[0]).toEqual(item);
    });

    test('should append item to existing data', () => {
      storage.append({ id: '1', name: 'First' });
      const result = storage.append({ id: '2', name: 'Second' });
      
      expect(result).toBe(true);
      expect(storage.read()).toHaveLength(2);
    });
  });

  describe('update', () => {
    test('should update existing item', () => {
      storage.append({ id: '1', name: 'Original' });
      const result = storage.update('1', { name: 'Updated' });
      
      expect(result).toBe(true);
      const item = storage.findById('1');
      expect(item.name).toBe('Updated');
      expect(item.id).toBe('1');
    });

    test('should return false for non-existent id', () => {
      expect(storage.update('999', { name: 'Test' })).toBe(false);
    });
  });

  describe('findById', () => {
    test('should find item by id', () => {
      storage.append({ id: '1', name: 'Test' });
      storage.append({ id: '2', name: 'Other' });
      
      const item = storage.findById('1');
      expect(item).toEqual({ id: '1', name: 'Test' });
    });

    test('should return undefined for non-existent id', () => {
      expect(storage.findById('999')).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    test('should find item by email', () => {
      storage.append({ id: '1', email: 'test@test.com' });
      storage.append({ id: '2', email: 'other@test.com' });
      
      const item = storage.findByEmail('test@test.com');
      expect(item).toEqual({ id: '1', email: 'test@test.com' });
    });

    test('should return undefined for non-existent email', () => {
      expect(storage.findByEmail('nonexistent@test.com')).toBeUndefined();
    });
  });

  describe('delete', () => {
    test('should delete item by id', () => {
      storage.append({ id: '1', name: 'Test' });
      storage.append({ id: '2', name: 'Other' });
      
      const result = storage.delete('1');
      
      expect(result).toBe(true);
      expect(storage.read()).toHaveLength(1);
      expect(storage.findById('1')).toBeUndefined();
    });

    test('should return false for non-existent id', () => {
      expect(storage.delete('999')).toBe(false);
    });
  });
});

