import { apiClient } from './client.js';

// ============ WORKOUT DAY APIs ============

// Get all workout days
export const fetchAllWorkoutDays = async () => {
  const { data } = await apiClient.get('/gym/workout-days');
  return data;
};

// Get a single workout day
export const fetchWorkoutDay = async (workoutDayId) => {
  const { data } = await apiClient.get(`/gym/workout-days/${workoutDayId}`);
  return data;
};

// Create a new workout day
export const createWorkoutDay = async (workoutDayData) => {
  const { data } = await apiClient.post('/gym/workout-days', workoutDayData);
  return data;
};

// Update a workout day
export const updateWorkoutDay = async (workoutDayId, updates) => {
  const { data } = await apiClient.put(`/gym/workout-days/${workoutDayId}`, updates);
  return data;
};

// Delete a workout day
export const deleteWorkoutDay = async (workoutDayId) => {
  const { data } = await apiClient.delete(`/gym/workout-days/${workoutDayId}`);
  return data;
};

// Add exercise to workout day
export const addExercise = async (workoutDayId, exerciseData) => {
  const { data } = await apiClient.post(`/gym/workout-days/${workoutDayId}/exercises`, exerciseData);
  return data;
};

// Update exercise in workout day
export const updateExercise = async (workoutDayId, exerciseId, updates) => {
  const { data } = await apiClient.put(`/gym/workout-days/${workoutDayId}/exercises/${exerciseId}`, updates);
  return data;
};

// Delete exercise from workout day
export const deleteExercise = async (workoutDayId, exerciseId) => {
  const { data } = await apiClient.delete(`/gym/workout-days/${workoutDayId}/exercises/${exerciseId}`);
  return data;
};

// ============ GYM LOG APIs ============

// Get gym logs for a user
export const fetchGymLogs = async (userId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  const { data } = await apiClient.get(`/gym/logs/${userId}?${params}`);
  return data;
};

// Get gym log for a specific date
export const fetchGymLogByDate = async (userId, date) => {
  const { data } = await apiClient.get(`/gym/logs/${userId}/date/${date}`);
  return data;
};

// Get gym logs for a month (for calendar view)
export const fetchGymLogsForMonth = async (userId, year, month) => {
  const { data } = await apiClient.get(`/gym/logs/${userId}/month/${year}/${month}`);
  return data;
};

// Create or update gym log
export const createGymLog = async (gymLogData) => {
  const { data } = await apiClient.post('/gym/logs', gymLogData);
  return data;
};

// Update gym log
export const updateGymLog = async (gymLogId, updates) => {
  const { data } = await apiClient.put(`/gym/logs/${gymLogId}`, updates);
  return data;
};

// Delete gym log
export const deleteGymLog = async (gymLogId) => {
  const { data } = await apiClient.delete(`/gym/logs/${gymLogId}`);
  return data;
};

// ============ STATISTICS APIs ============

// Get gym sessions count for current month
export const fetchMonthCount = async (userId) => {
  const { data } = await apiClient.get(`/gym/stats/${userId}/month-count`);
  return data;
};

// Get gym streak
export const fetchStreak = async (userId) => {
  const { data } = await apiClient.get(`/gym/stats/${userId}/streak`);
  return data;
};

// Get monthly gym activity stats
export const fetchMonthlyStats = async (userId) => {
  const { data } = await apiClient.get(`/gym/stats/${userId}/monthly`);
  return data;
};
