// UUID utility for generating unique IDs
const { v4: uuidv4 } = require('uuid');

// Since uuid is not included in auth.js dependencies, we need to install it
// For now, we'll use a simple alternative
function generateUUID() {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

module.exports = { generateUUID };
