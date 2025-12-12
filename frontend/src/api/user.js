import { apiClient } from './client.js'

export const createOrFetchUser = async ({ name, email }) => {
  const { data } = await apiClient.post('/users', { name, email })
  return data
}

export const fetchUser = async (userId) => {
  const { data } = await apiClient.get(`/users/${userId}`)
  return data
}
