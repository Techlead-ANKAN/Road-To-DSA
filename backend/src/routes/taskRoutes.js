import express from 'express';
import {
  getTasks,
  getTasksByDate,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  getTodayCount,
  getCompletedCount,
  getWeeklyStats,
  getWorkStreak,
  getTasksForMonth,
} from '../controllers/taskController.js';

const router = express.Router();

// Task CRUD
router.get('/:userId', getTasks);
router.get('/:userId/date/:date', getTasksByDate);
router.get('/:userId/month/:year/:month', getTasksForMonth);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Task reordering
router.post('/reorder', reorderTasks);

// Statistics
router.get('/:userId/stats/today', getTodayCount);
router.get('/:userId/stats/completed', getCompletedCount);
router.get('/:userId/stats/weekly', getWeeklyStats);
router.get('/:userId/stats/work-streak', getWorkStreak);

export default router;
