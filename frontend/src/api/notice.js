import { apiClient } from './client.js';

// Fetch all notices for a user
export const fetchNotices = async (userId) => {
  const { data } = await apiClient.get(`/notices/${userId}`);
  return data;
};

// Create a new notice
export const createNotice = async (noticeData) => {
  const { data } = await apiClient.post('/notices', noticeData);
  return data;
};

// Update a notice
export const updateNotice = async (noticeId, updates) => {
  const { data } = await apiClient.put(`/notices/${noticeId}`, updates);
  return data;
};

// Delete a notice
export const deleteNotice = async (noticeId) => {
  const { data } = await apiClient.delete(`/notices/${noticeId}`);
  return data;
};

// Mark a notice as done
export const markNoticeDone = async (noticeId, isDone = true) => {
  const { data } = await apiClient.patch(`/notices/${noticeId}/done`, { isDone });
  return data;
};
