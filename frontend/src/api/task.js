import { apiClient } from './client.js';

// Get tasks for a user with optional filters
export const fetchTasks = async (userId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.date) params.append('date', filters.date);
  
  const { data } = await apiClient.get(`/tasks/${userId}?${params}`);
  return data;
};

// Get tasks for a specific date
export const fetchTasksByDate = async (userId, date) => {
  const { data } = await apiClient.get(`/tasks/${userId}/date/${date}`);
  return data;
};

// Get tasks for a month (for calendar view)
export const fetchTasksForMonth = async (userId, year, month) => {
  const { data } = await apiClient.get(`/tasks/${userId}/month/${year}/${month}`);
  return data;
};

// Create a new task
export const createTask = async (taskData) => {
  const { data } = await apiClient.post('/tasks', taskData);
  return data;
};

// Update a task
export const updateTask = async (taskId, updates) => {
  const { data } = await apiClient.put(`/tasks/${taskId}`, updates);
  return data;
};

// Delete a task
export const deleteTask = async (taskId) => {
  const { data } = await apiClient.delete(`/tasks/${taskId}`);
  return data;
};

// Reorder tasks
export const reorderTasks = async (taskId1, taskId2) => {
  const { data } = await apiClient.post('/tasks/reorder', { taskId1, taskId2 });
  return data;
};

// Get today's task counts (assigned and completed)
export const fetchTodayCount = async (userId) => {
  const { data } = await apiClient.get(`/tasks/${userId}/stats/today`);
  return data;
};

// Get total completed task count
export const fetchCompletedCount = async (userId) => {
  const { data } = await apiClient.get(`/tasks/${userId}/stats/completed`);
  return data;
};

// Get weekly task completion stats
export const fetchWeeklyStats = async (userId) => {
  const { data } = await apiClient.get(`/tasks/${userId}/stats/weekly`);
  return data;
};

// Get work streak (75% completion rule)
export const fetchWorkStreak = async (userId) => {
  const { data } = await apiClient.get(`/tasks/${userId}/stats/work-streak`);
  return data;
};
