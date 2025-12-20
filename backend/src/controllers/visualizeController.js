import axios from 'axios';

// Judge0 API Configuration (RapidAPI)
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'judge0-ce.p.rapidapi.com';

// Language IDs for Judge0
const LANGUAGE_IDS = {
  java: 62,
  python: 71,
  cpp: 54,
  javascript: 63,
  c: 50
};

// Daily usage tracking (in-memory for simplicity)
// In production, use Redis or database
const dailyUsage = new Map(); // Format: { userId-date: count }
const DAILY_LIMIT = 45;

// Helper to get today's date key
const getTodayKey = (userId) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${userId}-${today}`;
};

// Get current usage for user today
const getCurrentUsage = (userId) => {
  const key = getTodayKey(userId);
  return dailyUsage.get(key) || 0;
};

// Increment usage counter
const incrementUsage = (userId) => {
  const key = getTodayKey(userId);
  const current = getCurrentUsage(userId);
  dailyUsage.set(key, current + 1);
  return current + 1;
};

/**
 * Execute code using Judge0 API
 */
export const executeCode = async (req, res) => {
  try {
    const { code, language = 'java', stdin = '', userId = 'default' } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Check daily limit
    const currentUsage = getCurrentUsage(userId);
    if (currentUsage >= DAILY_LIMIT) {
      return res.status(429).json({ 
        error: `Daily limit of ${DAILY_LIMIT} executions reached. Try again tomorrow!`,
        usage: {
          used: currentUsage,
          limit: DAILY_LIMIT,
          remaining: 0
        }
      });
    }

    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({ 
        error: `Unsupported language: ${language}. Supported: java, python, cpp, javascript, c` 
      });
    }

    // Check if API key is configured
    if (!RAPIDAPI_KEY) {
      return res.status(500).json({ 
        error: 'Judge0 API key not configured. Please set RAPIDAPI_KEY in .env file' 
      });
    }

    // Submit code to Judge0
    const submissionResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: languageId,
        stdin: stdin,
        cpu_time_limit: 2,
        memory_limit: 128000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
        timeout: 10000,
      }
    );

    const result = submissionResponse.data;

    // Increment usage counter after successful execution
    const newUsage = incrementUsage(userId);

    // Format response
    const response = {
      status: result.status?.description || 'Unknown',
      statusId: result.status?.id,
      output: result.stdout || '',
      error: result.stderr || result.compile_output || '',
      time: result.time,
      memory: result.memory,
      exitCode: result.exit_code,
      usage: {
        used: newUsage,
        limit: DAILY_LIMIT,
        remaining: DAILY_LIMIT - newUsage
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Execute code error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid Judge0 API key. Please check your RAPIDAPI_KEY in .env file' 
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later or upgrade your Judge0 API plan' 
      });
    }

    res.status(500).json({ 
      error: 'Code execution failed', 
      details: error.message 
    });
  }
};

/**
 * Get supported languages
 */
export const getSupportedLanguages = async (req, res) => {
  try {
    res.json({
      languages: [
        { id: 'java', name: 'Java', version: 'OpenJDK 13.0.1' },
        { id: 'python', name: 'Python', version: '3.8.1' },
        { id: 'cpp', name: 'C++', version: 'GCC 9.2.0' },
        { id: 'javascript', name: 'JavaScript', version: 'Node.js 12.14.0' },
        { id: 'c', name: 'C', version: 'GCC 9.2.0' },
      ]
    });
  } catch (error) {
    console.error('Get languages error:', error.message);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
};

/**
 * Get current daily usage for user
 */
export const getDailyUsage = async (req, res) => {
  try {
    const { userId = 'default' } = req.query;
    const currentUsage = getCurrentUsage(userId);
    
    res.json({
      usage: {
        used: currentUsage,
        limit: DAILY_LIMIT,
        remaining: DAILY_LIMIT - currentUsage
      }
    });
  } catch (error) {
    console.error('Get usage error:', error.message);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
};

/**
 * Parse and analyze code (basic implementation)
 * For MVP, this returns basic line-by-line structure
 * Can be enhanced later with AST parsing
 */
export const analyzeCode = async (req, res) => {
  try {
    const { code, language = 'java' } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Basic line-by-line analysis
    const lines = code.split('\n');
    const analysis = {
      totalLines: lines.length,
      codeLines: lines.filter(line => line.trim() && !line.trim().startsWith('//')).length,
      emptyLines: lines.filter(line => !line.trim()).length,
      commentLines: lines.filter(line => line.trim().startsWith('//')).length,
      lines: lines.map((line, index) => ({
        lineNumber: index + 1,
        content: line,
        type: getLineType(line)
      }))
    };

    res.json(analysis);
  } catch (error) {
    console.error('Analyze code error:', error.message);
    res.status(500).json({ error: 'Code analysis failed', details: error.message });
  }
};

// Helper function to determine line type
function getLineType(line) {
  const trimmed = line.trim();
  if (!trimmed) return 'empty';
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return 'comment';
  if (trimmed.includes('if') || trimmed.includes('else')) return 'conditional';
  if (trimmed.includes('for') || trimmed.includes('while')) return 'loop';
  if (trimmed.includes('return')) return 'return';
  if (trimmed.includes('class ') || trimmed.includes('public ') || trimmed.includes('private ')) return 'declaration';
  return 'code';
}
