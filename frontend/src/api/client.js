import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed'
    const wrappedError = new Error(message)
    wrappedError.status = error.response?.status
    wrappedError.data = error.response?.data
    return Promise.reject(wrappedError)
  }
)
