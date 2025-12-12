import { apiClient } from './client.js'

export const fetchCourseOverview = async () => {
  const { data } = await apiClient.get('/course')
  return data
}

export const fetchCourseStep = async (stepIndex) => {
  const { data } = await apiClient.get(`/course/${stepIndex}`)
  return data
}
