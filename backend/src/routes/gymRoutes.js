import express from 'express';
import {
  getAllWorkoutDays,
  getWorkoutDay,
  createWorkoutDay,
  updateWorkoutDay,
  deleteWorkoutDay,
  addExercise,
  updateExercise,
  deleteExercise,
  getGymLogs,
  getGymLogByDate,
  createGymLog,
  updateGymLog,
  deleteGymLog,
  getGymLogsForMonth,
  getMonthCount,
  getStreak,
  getMonthlyStats,
} from '../controllers/gymController.js';

const router = express.Router();

// Workout Day routes
router.get('/workout-days', getAllWorkoutDays);
router.get('/workout-days/:id', getWorkoutDay);
router.post('/workout-days', createWorkoutDay);
router.put('/workout-days/:id', updateWorkoutDay);
router.delete('/workout-days/:id', deleteWorkoutDay);

// Exercise management within workout day
router.post('/workout-days/:id/exercises', addExercise);
router.put('/workout-days/:id/exercises/:exerciseId', updateExercise);
router.delete('/workout-days/:id/exercises/:exerciseId', deleteExercise);

// Gym Log routes
router.get('/logs/:userId', getGymLogs);
router.get('/logs/:userId/date/:date', getGymLogByDate);
router.get('/logs/:userId/month/:year/:month', getGymLogsForMonth);
router.post('/logs', createGymLog);
router.put('/logs/:id', updateGymLog);
router.delete('/logs/:id', deleteGymLog);

// Statistics
router.get('/stats/:userId/month-count', getMonthCount);
router.get('/stats/:userId/streak', getStreak);
router.get('/stats/:userId/monthly', getMonthlyStats);

export default router;
