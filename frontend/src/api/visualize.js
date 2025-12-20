import { apiClient } from './client.js'

export const executeCode = async (payload) => {
  const { data } = await apiClient.post('/visualize/execute', payload)
  return data
}

export const analyzeCode = async (payload) => {
  const { data } = await apiClient.post('/visualize/analyze', payload)
  return data
}

export const getSupportedLanguages = async () => {
  const { data } = await apiClient.get('/visualize/languages')
  return data
}

export const getDailyUsage = async (userId) => {
  const { data } = await apiClient.get('/visualize/usage', {
    params: { userId }
  })
  return data
}
