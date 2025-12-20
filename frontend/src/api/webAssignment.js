import { apiClient } from './client';

export const webAssignmentAPI = {
  // Get all assignments
  getAllAssignments: async () => {
    const response = await apiClient.get('/web-assignments');
    return response.data;
  },

  // Get single assignment
  getAssignment: async (id) => {
    const response = await apiClient.get(`/web-assignments/${id}`);
    return response.data;
  },

  // Get assignment with user's solution
  getAssignmentWithSolution: async (id, userId) => {
    const response = await apiClient.get(`/web-assignments/${id}/solution?userId=${userId}`);
    return response.data;
  },

  // Create new assignment (admin)
  createAssignment: async (assignmentData) => {
    const response = await apiClient.post('/web-assignments', assignmentData);
    return response.data;
  },

  // Update assignment (admin)
  updateAssignment: async (id, assignmentData) => {
    const response = await apiClient.put(`/web-assignments/${id}`, assignmentData);
    return response.data;
  },

  // Delete assignment (admin)
  deleteAssignment: async (id) => {
    const response = await apiClient.delete(`/web-assignments/${id}`);
    return response.data;
  },

  // Save user's solution
  saveSolution: async (id, solutionData) => {
    const response = await apiClient.post(`/web-assignments/${id}/solution`, solutionData);
    return response.data;
  },

  // Mark assignment as complete/incomplete
  markComplete: async (id, data) => {
    const response = await apiClient.post(`/web-assignments/${id}/complete`, data);
    return response.data;
  },

  // Get all user's solutions
  getUserSolutions: async (userId) => {
    const response = await apiClient.get(`/web-assignments/user/${userId}/solutions`);
    return response.data;
  },
};
