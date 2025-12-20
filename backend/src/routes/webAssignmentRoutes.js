import express from 'express';
const router = express.Router();
import * as webAssignmentController from '../controllers/webAssignmentController.js';

// Get all assignments
router.get('/', webAssignmentController.getAllAssignments);

// Get single assignment
router.get('/:id', webAssignmentController.getAssignment);

// Get assignment with user's solution
router.get('/:id/solution', webAssignmentController.getAssignmentWithSolution);

// Create new assignment (admin)
router.post('/', webAssignmentController.createAssignment);

// Update assignment (admin)
router.put('/:id', webAssignmentController.updateAssignment);

// Delete assignment (admin)
router.delete('/:id', webAssignmentController.deleteAssignment);

// Save user's solution
router.post('/:id/solution', webAssignmentController.saveSolution);

// Mark assignment as complete/incomplete
router.post('/:id/complete', webAssignmentController.markComplete);

// Get all user's solutions
router.get('/user/:userId/solutions', webAssignmentController.getUserSolutions);

export default router;
