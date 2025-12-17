import { apiClient } from './client.js'

// Get all subjects
export const fetchSubjects = async () => {
  const { data } = await apiClient.get('/interview-questions/subjects')
  return data
}

// Create a new subject
export const createSubject = async (subjectData) => {
  const { data } = await apiClient.post('/interview-questions/subjects', subjectData)
  return data
}

// Update a subject
export const updateSubject = async (id, subjectData) => {
  const { data } = await apiClient.put(`/interview-questions/subjects/${id}`, subjectData)
  return data
}

// Delete a subject
export const deleteSubject = async (id) => {
  const { data } = await apiClient.delete(`/interview-questions/subjects/${id}`)
  return data
}

// Get all tags (optionally filtered by subject)
export const fetchTags = async (subject) => {
  const { data } = await apiClient.get('/interview-questions/tags', {
    params: subject ? { subject } : {}
  })
  return data
}

// Get questions by subject (with optional tag filter)
export const fetchQuestionsBySubject = async (subject, tag) => {
  const { data } = await apiClient.get(`/interview-questions/subject/${subject}`, {
    params: tag ? { tag } : {}
  })
  return data
}

// Get a single question by ID
export const fetchQuestionById = async (id) => {
  const { data } = await apiClient.get(`/interview-questions/${id}`)
  return data
}

// Create a new question
export const createQuestion = async (questionData) => {
  const { data } = await apiClient.post('/interview-questions', questionData)
  return data
}

// Update a question
export const updateQuestion = async (id, questionData) => {
  const { data } = await apiClient.put(`/interview-questions/${id}`, questionData)
  return data
}

// Delete a question
export const deleteQuestion = async (id) => {
  const { data } = await apiClient.delete(`/interview-questions/${id}`)
  return data
}

// Get statistics
export const fetchStats = async () => {
  const { data } = await apiClient.get('/interview-questions/stats')
  return data
}
