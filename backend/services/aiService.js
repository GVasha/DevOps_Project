const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AIService {
  constructor() {
    // Sanitize API key to avoid subtle issues from .env formatting
   
    this.openaiApiKey = 'API_KEY_HERE'
  }

  // Analyze car damage using OpenAI Vision API
  async analyzeCarDamageWithOpenAI(imagePath) {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Read and encode image to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `You are an expert automotive damage assessor. Analyze this car image thoroughly and provide a complete damage assessment.

**IMPORTANT: You must provide ALL fields, even if uncertain. Make your best professional estimate.**

Assess and categorize the damage:

1. **Severity** (choose one): None, Minor, Moderate, Severe, Total Loss
2. **Damage Types** (list all visible): scratches, dents, broken parts, missing components, paint damage, glass damage, structural damage, etc.
3. **Cost Category** (format as "Category: Range"): 
   - Low: $0-500
   - Medium: $500-2000
   - High: $2000-5000
   - Very High: $5000+
4. **Affected Areas** (list all): front bumper, rear bumper, hood, roof, doors, fenders, headlights, taillights, windshield, wheels, etc.
5. **Safety Concerns** (describe any safety issues or state "No immediate safety concerns identified")
6. **Confidence** (1-10): Your confidence level in this assessment
7. **Summary** (2-3 sentences): Professional assessment explanation

**You must respond in valid JSON format with ALL fields filled:**
{
  "severity": "one of: None, Minor, Moderate, Severe, Total Loss",
  "damageTypes": ["array of damage types"],
  "costCategory": "Category: $range",
  "affectedAreas": ["array of affected areas"],
  "safetyConcerns": "description or none identified",
  "confidence": 1-10,
  "summary": "detailed explanation"
}

Provide your complete assessment now.`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const analysis = response.data.choices[0].message.content || '';

      // Robustly extract JSON from possible code fences or prefixed text
      const extracted = this.extractJsonBlock(analysis);

      const normalized = this.normalizeAnalysis(extracted);
      return {
        success: true,
        analysis: normalized,
        provider: 'OpenAI GPT-4 Vision'
      };

    } catch (error) {
      // Avoid logging sensitive headers; show concise, useful diagnostics
      const status = error.response?.status;
      const providerMsg = error.response?.data?.error?.message || error.message;
      console.error('OpenAI analysis error:', { status, message: providerMsg });
      throw new Error(`AI analysis failed: ${providerMsg}`);
    }
  }

  // Fallback: Simple rule-based damage detection (when AI APIs are not available)
  async analyzeCarDamageBasic(imagePath) {
    try {
      // This is a mock analysis for demonstration
      // In a real scenario, you might use image processing libraries
      // or other computer vision techniques
      
      const fileStats = fs.statSync(imagePath);
      const fileSize = fileStats.size;
      
      // Mock analysis based on file characteristics
      // This is just for demonstration - replace with actual image analysis
      let severity = 'Minor';
      let confidence = 3;
      
      if (fileSize > 2 * 1024 * 1024) { // Files > 2MB might have more detail
        severity = 'Moderate';
        confidence = 4;
      }
      
      if (fileSize > 5 * 1024 * 1024) { // Files > 5MB might show severe damage
        severity = 'Severe';
        confidence = 5;
      }

      return {
        success: true,
        analysis: {
          severity: severity,
          damageTypes: ['Surface scratches', 'Possible dents'],
          costCategory: severity === 'Minor' ? 'Low' : severity === 'Moderate' ? 'Medium' : 'High',
          affectedAreas: ['Unknown - requires manual inspection'],
          safetyConcerns: 'Manual inspection recommended',
          confidence: confidence,
          summary: `Basic analysis suggests ${severity.toLowerCase()} damage. Professional inspection recommended for accurate assessment.`
        },
        provider: 'Basic Analysis (Demo)',
        note: 'This is a demonstration. Configure AI API keys for accurate analysis.'
      };

    } catch (error) {
      console.error('Basic analysis error:', error);
      throw new Error(`Basic analysis failed: ${error.message}`);
    }
  }

  // Main analysis method that tries different providers
  async analyzeCarDamage(imagePath) {
    try {
      // Try OpenAI first if API key is available
      if (this.openaiApiKey) {
        try {
          return await this.analyzeCarDamageWithOpenAI(imagePath);
        } catch (openaiError) {
          console.warn('OpenAI analysis failed, falling back to basic analysis:', openaiError.message);
        }
      }

      // Fallback to basic analysis
      return await this.analyzeCarDamageBasic(imagePath);

    } catch (error) {
      console.error('All analysis methods failed:', error);
      return {
        success: false,
        error: error.message,
        analysis: {
          severity: 'Unknown',
          summary: 'Analysis failed. Please try again or contact support.',
          confidence: 0
        }
      };
    }
  }

  // Helper method to get MIME type from file path
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  // Validate if analysis result meets quality standards
  validateAnalysis(analysis) {
    const requiredFields = ['severity', 'summary', 'confidence'];
    const hasRequiredFields = requiredFields.every(field => 
      analysis.hasOwnProperty(field)
    );

    const validSeverityLevels = ['None', 'Minor', 'Moderate', 'Severe', 'Total Loss', 'Unknown'];
    const hasValidSeverity = validSeverityLevels.includes(analysis.severity);

    const hasValidConfidence = typeof analysis.confidence === 'number' && 
                              analysis.confidence >= 0 && 
                              analysis.confidence <= 10;

    return hasRequiredFields && hasValidSeverity && hasValidConfidence;
  }

  // Extract JSON payload from free-form/markdown responses
  extractJsonBlock(text) {
    if (!text) return {};
    const str = String(text);
    
    // Try code fences ```json ... ``` or ``` ... ```
    const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/i;
    const fenceMatch = str.match(fenceRegex);
    if (fenceMatch && fenceMatch[1]) {
      const fenced = fenceMatch[1].trim();
      try { return JSON.parse(fenced); } catch (_) {}
    }

    // Try first JSON-like object
    const objRegex = /\{[\s\S]*\}/;
    const objMatch = str.match(objRegex);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch (_) {}
    }

    // Fallback: return summary-only
    return { summary: str };
  }

  // Normalize various shapes of AI output into a consistent schema
  normalizeAnalysis(raw) {
    const toArray = (value) => {
      if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
      if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean);
      if (value == null) return [];
      return [String(value).trim()].filter(Boolean);
    };

    const pickCategory = (val) => {
      if (!val) return 'Unknown';
      const str = String(val).trim();
      
      // Handle "Category: Very High: $5000+" format
      if (str.toLowerCase().startsWith('category:')) {
        const parts = str.split(':').map(p => p.trim());
        // parts = ["Category", "Very High", "$5000+"] or ["Category", "$5000+"]
        
        // Check if second part is a valid category
        const allowed = ['None','Low','Medium','High','Very High'];
        if (parts.length > 1 && allowed.includes(parts[1])) {
          return parts[1]; // Return "Very High"
        }
        
        // Otherwise map dollar range to category
        const dollarPart = parts.slice(1).join(':');
        if (dollarPart.includes('5000+') || dollarPart.includes('$5000')) return 'Very High';
        if (dollarPart.includes('2000') && dollarPart.includes('5000')) return 'High';
        if (dollarPart.includes('500') && dollarPart.includes('2000')) return 'Medium';
        if (dollarPart.includes('$0') || dollarPart.includes('500')) return 'Low';
        return 'Unknown';
      }
      
      // Standard format like "Very High: $5000+"
      const beforeColon = str.split(':')[0].trim();
      const allowed = ['None','Low','Medium','High','Very High'];
      return allowed.includes(beforeColon) ? beforeColon : 'Unknown';
    };

    const normalizeSeverity = (val) => {
      if (!val) return 'Unknown';
      const map = {
        'none':'None', 'minor':'Minor', 'moderate':'Moderate', 'severe':'Severe', 'total loss':'Total Loss', 'unknown':'Unknown'
      };
      const key = String(val).toLowerCase();
      return map[key] || String(val);
    };

    const confidenceNum = (val) => {
      const n = typeof val === 'number' ? val : parseFloat(val);
      if (isNaN(n)) return 0;
      return Math.max(0, Math.min(10, Math.round(n)));
    };

    const damageTypes = toArray(raw.damageTypes);
    const affectedAreas = toArray(raw.affectedAreas);
    const safetyList = toArray(raw.safetyConcerns);
    const safetyConcerns = safetyList.length > 0 ? safetyList.join(', ') : (typeof raw.safetyConcerns === 'string' && raw.safetyConcerns ? raw.safetyConcerns : null);
    const summary = (raw.summary && String(raw.summary).trim()) || '';
    const costCategory = pickCategory(raw.costCategory);
    
    // Extract cost range from formats like "Category: Very High: $5000+" or "Very High: $5000+"
    let costRange = null;
    if (typeof raw.costCategory === 'string' && raw.costCategory.includes(':')) {
      const parts = raw.costCategory.split(':').map(p => p.trim());
      // Find the part that looks like a dollar amount
      const dollarPart = parts.find(p => p.includes('$'));
      if (dollarPart) {
        costRange = dollarPart;
      } else if (parts.length > 1) {
        // Last part after all colons
        costRange = parts[parts.length - 1];
      }
    }

    const normalized = {
      severity: normalizeSeverity(raw.severity),
      damageTypes,
      costCategory,
      ...(costRange ? { costRange } : {}),
      affectedAreas,
      safetyConcerns,
      confidence: confidenceNum(raw.confidence),
      summary
    };

    // Minimal dev log (disable in production)
    if (process.env.NODE_ENV !== 'production') {
      // Intentionally concise to avoid log noise
      console.log('AI normalized:', normalized.severity, normalized.costCategory, normalized.confidence);
    }

    // Final validation fallback
    if (!this.validateAnalysis(normalized)) {
      return {
        severity: 'Unknown',
        damageTypes,
        costCategory,
        ...(costRange ? { costRange } : {}),
        affectedAreas,
        safetyConcerns,
        confidence: normalized.confidence ?? 0,
        summary: summary || 'Analysis normalized with missing fields.'
      };
    }

    return normalized;
  }
}

module.exports = new AIService();
