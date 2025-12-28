import { apiClient } from './client.js';

/**
 * Fetch time logs with optional filters
 * @param {string} userId - User ID
 * @param {object} filters - Optional filters (startDate, endDate, limit)
 * @returns {Promise} Time logs data
 */
export const fetchTimeLogs = async (userId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.limit) params.append('limit', filters.limit);

  const { data } = await apiClient.get(`/time-logs/${userId}?${params}`);
  return data;
};

/**
 * Fetch time log for a specific date
 * @param {string} userId - User ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise} Time log for the date
 */
export const fetchTimeLogByDate = async (userId, date) => {
  const { data } = await apiClient.get(`/time-logs/${userId}/date/${date}`);
  return data;
};

/**
 * Fetch time logs for a specific month
 * @param {string} userId - User ID
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise} Time logs keyed by date
 */
export const fetchTimeLogsForMonth = async (userId, year, month) => {
  const { data } = await apiClient.get(`/time-logs/${userId}/month/${year}/${month}`);
  return data;
};

/**
 * Create or update a time log
 * @param {object} logData - Time log data (userId, date, entries)
 * @returns {Promise} Created/updated time log
 */
export const createOrUpdateTimeLog = async (logData) => {
  const { data } = await apiClient.post('/time-logs', logData);
  return data;
};

/**
 * Delete a time log
 * @param {string} logId - Time log ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteTimeLog = async (logId) => {
  const { data } = await apiClient.delete(`/time-logs/${logId}`);
  return data;
};

/**
 * Add a time entry to an existing log
 * @param {string} logId - Time log ID
 * @param {object} entryData - Entry data (startTime, endTime, durationMinutes, description, category)
 * @returns {Promise} Updated time log
 */
export const addTimeEntry = async (logId, entryData) => {
  const { data } = await apiClient.post(`/time-logs/${logId}/entries`, entryData);
  return data;
};

/**
 * Update a time entry
 * @param {string} logId - Time log ID
 * @param {string} entryId - Entry ID
 * @param {object} updates - Fields to update
 * @returns {Promise} Updated time log
 */
export const updateTimeEntry = async (logId, entryId, updates) => {
  const { data } = await apiClient.put(`/time-logs/${logId}/entries/${entryId}`, updates);
  return data;
};

/**
 * Delete a time entry
 * @param {string} logId - Time log ID
 * @param {string} entryId - Entry ID
 * @returns {Promise} Updated time log
 */
export const deleteTimeEntry = async (logId, entryId) => {
  const { data } = await apiClient.delete(`/time-logs/${logId}/entries/${entryId}`);
  return data;
};

/**
 * Get today's total hours
 * @param {string} userId - User ID
 * @returns {Promise} Today's stats
 */
export const fetchTodayTotal = async (userId) => {
  const { data } = await apiClient.get(`/time-logs/${userId}/stats/today`);
  return data;
};

/**
 * Get weekly stats (last 7 days)
 * @param {string} userId - User ID
 * @returns {Promise} Weekly stats array
 */
export const fetchWeeklyStats = async (userId) => {
  const { data } = await apiClient.get(`/time-logs/${userId}/stats/weekly`);
  return data;
};

/**
 * Get monthly stats
 * @param {string} userId - User ID
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise} Monthly stats
 */
export const fetchMonthlyStats = async (userId, year, month) => {
  const { data } = await apiClient.get(`/time-logs/${userId}/stats/monthly/${year}/${month}`);
  return data;
};
