const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

class FileStorage {
  constructor(filename) {
    this.filePath = path.join(dataDir, filename);
    this.ensureFileExists();
  }

  ensureFileExists() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${this.filePath}:`, error);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${this.filePath}:`, error);
      return false;
    }
  }

  append(item) {
    const data = this.read();
    data.push(item);
    return this.write(data);
  }

  update(id, updatedItem) {
    const data = this.read();
    const index = data.findIndex(item => item.id === id);
    
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedItem };
      return this.write(data);
    }
    
    return false;
  }

  findById(id) {
    const data = this.read();
    if (!Array.isArray(data)) {
      return undefined;
    }
    return data.find(item => item.id === id);
  }

  findByEmail(email) {
    const data = this.read();
    if (!Array.isArray(data)) {
      return undefined;
    }
    return data.find(item => item.email === email);
  }

  delete(id) {
    const data = this.read();
    const filteredData = data.filter(item => item.id !== id);
    
    if (filteredData.length !== data.length) {
      return this.write(filteredData);
    }
    
    return false;
  }
}

module.exports = FileStorage;
