import { apiClient } from './client.js'

export const initUserProgress = async ({ userId, courseId }) => {
  const { data } = await apiClient.post('/progress/init', { userId, courseId })
  return data
}

export const fetchUserProgress = async ({ userId, courseId }) => {
  const { data } = await apiClient.get(`/progress/${userId}`, {
    params: { courseId }
  })
  return data
}

export const markProblem = async (payload) => {
  const { data } = await apiClient.post('/progress/mark', payload)
  return data
}

export const saveProblemCode = async (payload) => {
  const { data } = await apiClient.post('/progress/saveCode', payload)
  return data
}

export const exportSolvedCsv = ({ userId, courseId }) => {
  return apiClient.get(`/progress/export/${userId}`, {
    params: { courseId },
    responseType: 'blob'
  })
}
