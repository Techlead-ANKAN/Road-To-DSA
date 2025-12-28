import express from 'express'
import * as timeLogController from '../controllers/timeLogController.js'

const router = express.Router()

// Time log CRUD routes
router.get('/:userId', timeLogController.getTimeLogs)
router.get('/:userId/date/:date', timeLogController.getTimeLogByDate)
router.get('/:userId/month/:year/:month', timeLogController.getTimeLogsForMonth)
router.post('/', timeLogController.createOrUpdateTimeLog)
router.delete('/:logId', timeLogController.deleteTimeLog)

// Time entry routes
router.post('/:logId/entries', timeLogController.addTimeEntry)
router.put('/:logId/entries/:entryId', timeLogController.updateTimeEntry)
router.delete('/:logId/entries/:entryId', timeLogController.deleteTimeEntry)

// Stats routes
router.get('/:userId/stats/today', timeLogController.getTodayTotal)
router.get('/:userId/stats/weekly', timeLogController.getWeeklyStats)
router.get('/:userId/stats/monthly/:year/:month', timeLogController.getMonthlyStats)

export default router
