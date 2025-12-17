import express from 'express'
import * as interviewQuestionController from '../controllers/interviewQuestionController.js'

const router = express.Router()

// Get all subjects
router.get('/subjects', interviewQuestionController.getAllSubjects)

// Create a new subject
router.post('/subjects', interviewQuestionController.createSubject)

// Update a subject
router.put('/subjects/:id', interviewQuestionController.updateSubject)

// Delete a subject
router.delete('/subjects/:id', interviewQuestionController.deleteSubject)

// Get all tags (optionally filtered by subject)
router.get('/tags', interviewQuestionController.getAllTags)

// Get statistics
router.get('/stats', interviewQuestionController.getStats)

// Get questions by subject
router.get('/subject/:subject', interviewQuestionController.getQuestionsBySubject)

// Get a single question by ID
router.get('/:id', interviewQuestionController.getQuestionById)

// Create a new question
router.post('/', interviewQuestionController.createQuestion)

// Update a question
router.put('/:id', interviewQuestionController.updateQuestion)

// Delete a question
router.delete('/:id', interviewQuestionController.deleteQuestion)

export default router
