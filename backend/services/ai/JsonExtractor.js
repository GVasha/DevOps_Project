/**
 * Extracts JSON from free-form/markdown AI responses
 * Follows Single Responsibility Principle
 */

class JsonExtractor {
  /**
   * Extracts JSON block from text response
   */
  extract(text) {
    if (!text) return {};
    
    const str = String(text);
    
    // Try code fences ```json ... ``` or ``` ... ```
    const fencedJson = this.extractFromCodeFences(str);
    if (fencedJson) return fencedJson;

    // Try first JSON-like object
    const objectJson = this.extractFromObject(str);
    if (objectJson) return objectJson;

    // Fallback: return summary-only
    return { summary: str };
  }

  /**
   * Extracts JSON from code fences
   */
  extractFromCodeFences(str) {
    const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/i;
    const fenceMatch = str.match(fenceRegex);
    if (fenceMatch && fenceMatch[1]) {
      const fenced = fenceMatch[1].trim();
      try {
        return JSON.parse(fenced);
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  /**
   * Extracts JSON from object-like text
   */
  extractFromObject(str) {
    const objRegex = /\{[\s\S]*\}/;
    const objMatch = str.match(objRegex);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}

module.exports = JsonExtractor;

