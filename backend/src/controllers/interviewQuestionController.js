import InterviewQuestion from '../models/InterviewQuestion.js'
import Subject from '../models/Subject.js'

// Get all subjects
export const getAllSubjects = async (req, res) => {
  const subjects = await Subject.find().sort({ order: 1, name: 1 })
  res.json({ subjects })
}

// Create a new subject
export const createSubject = async (req, res) => {
  const { name, description, order } = req.body

  if (!name) {
    const error = new Error('Subject name is required')
    error.status = 400
    throw error
  }

  const existingSubject = await Subject.findOne({ name: name.trim() })
  if (existingSubject) {
    const error = new Error('Subject already exists')
    error.status = 400
    throw error
  }

  const subject = await Subject.create({
    name: name.trim(),
    description: description || '',
    order: order || 0
  })

  res.status(201).json({
    message: 'Subject created successfully',
    subject
  })
}

// Update a subject
export const updateSubject = async (req, res) => {
  const { id } = req.params
  const { name, description, order } = req.body

  const subject = await Subject.findById(id)
  
  if (!subject) {
    const error = new Error('Subject not found')
    error.status = 404
    throw error
  }

  const oldName = subject.name

  if (name !== undefined && name.trim() !== oldName) {
    const existing = await Subject.findOne({ name: name.trim() })
    if (existing) {
      const error = new Error('Subject name already exists')
      error.status = 400
      throw error
    }
    subject.name = name.trim()
    
    // Update all questions with this subject
    await InterviewQuestion.updateMany(
      { subject: oldName },
      { subject: name.trim() }
    )
  }
  
  if (description !== undefined) subject.description = description
  if (order !== undefined) subject.order = order

  await subject.save()

  res.json({
    message: 'Subject updated successfully',
    subject
  })
}

// Delete a subject
export const deleteSubject = async (req, res) => {
  const { id } = req.params

  const subject = await Subject.findById(id)
  
  if (!subject) {
    const error = new Error('Subject not found')
    error.status = 404
    throw error
  }

  // Check if any questions use this subject
  const questionCount = await InterviewQuestion.countDocuments({ subject: subject.name })
  
  if (questionCount > 0) {
    const error = new Error(`Cannot delete subject. ${questionCount} question(s) are using this subject.`)
    error.status = 400
    throw error
  }

  await Subject.findByIdAndDelete(id)

  res.json({
    message: 'Subject deleted successfully',
    subjectId: id
  })
}

// Get all tags (optionally filtered by subject)
export const getAllTags = async (req, res) => {
  const { subject } = req.query
  const filter = subject ? { subject } : {}
  
  const tags = await InterviewQuestion.distinct('tags', filter)
  res.json({ tags: tags.sort() })
}

// Get questions by subject (with optional tag filter)
export const getQuestionsBySubject = async (req, res) => {
  const { subject } = req.params
  const { tag } = req.query

  if (!subject) {
    const error = new Error('Subject is required')
    error.status = 400
    throw error
  }

  const filter = { subject }
  if (tag) {
    filter.tags = tag
  }

  const questions = await InterviewQuestion.find(filter).sort({ order: 1, createdAt: 1 })
  
  res.json({
    subject,
    count: questions.length,
    questions
  })
}

// Get a single question by ID
export const getQuestionById = async (req, res) => {
  const { id } = req.params

  const question = await InterviewQuestion.findById(id)
  
  if (!question) {
    const error = new Error('Question not found')
    error.status = 404
    throw error
  }

  res.json({ question })
}

// Create a new question
export const createQuestion = async (req, res) => {
  const { subject, question, answer, answerFormat, tags, difficulty, order } = req.body

  if (!subject || !question || !answer) {
    const error = new Error('Subject, question, and answer are required')
    error.status = 400
    throw error
  }

  const newQuestion = await InterviewQuestion.create({
    subject: subject.trim(),
    question: question.trim(),
    answer,
    answerFormat: answerFormat || 'text',
    tags: tags || [],
    difficulty: difficulty || '',
    order: order || 0
  })

  res.status(201).json({
    message: 'Question created successfully',
    question: newQuestion
  })
}

// Update a question
export const updateQuestion = async (req, res) => {
  const { id } = req.params
  const { subject, question, answer, answerFormat, tags, difficulty, order } = req.body

  const existingQuestion = await InterviewQuestion.findById(id)
  
  if (!existingQuestion) {
    const error = new Error('Question not found')
    error.status = 404
    throw error
  }

  if (subject !== undefined) existingQuestion.subject = subject.trim()
  if (question !== undefined) existingQuestion.question = question.trim()
  if (answer !== undefined) existingQuestion.answer = answer
  if (answerFormat !== undefined) existingQuestion.answerFormat = answerFormat
  if (tags !== undefined) existingQuestion.tags = tags
  if (difficulty !== undefined) existingQuestion.difficulty = difficulty
  if (order !== undefined) existingQuestion.order = order

  await existingQuestion.save()

  res.json({
    message: 'Question updated successfully',
    question: existingQuestion
  })
}

// Delete a question
export const deleteQuestion = async (req, res) => {
  const { id } = req.params

  const question = await InterviewQuestion.findByIdAndDelete(id)
  
  if (!question) {
    const error = new Error('Question not found')
    error.status = 404
    throw error
  }

  res.json({
    message: 'Question deleted successfully',
    questionId: id
  })
}

// Get statistics
export const getStats = async (req, res) => {
  const subjects = await InterviewQuestion.distinct('subject')
  
  const stats = await Promise.all(
    subjects.map(async (subject) => {
      const count = await InterviewQuestion.countDocuments({ subject })
      return { subject, count }
    })
  )

  const totalQuestions = await InterviewQuestion.countDocuments()

  res.json({
    totalQuestions,
    totalSubjects: subjects.length,
    bySubject: stats
  })
}
