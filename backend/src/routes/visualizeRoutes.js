import express from 'express';
import { executeCode, getSupportedLanguages, analyzeCode, getDailyUsage } from '../controllers/visualizeController.js';

const router = express.Router();

// Execute code
router.post('/execute', executeCode);

// Get supported languages
router.get('/languages', getSupportedLanguages);

// Analyze code structure
router.post('/analyze', analyzeCode);

// Get daily usage
router.get('/usage', getDailyUsage);

export default router;
