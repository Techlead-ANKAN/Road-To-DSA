import { Router } from 'express'
import {
  exportSolvedCsv,
  getProgressForUser,
  initProgressForUser,
  markProblemCompletion,
  saveProblemCode
} from '../controllers/progressController.js'

const router = Router()

router.post('/init', initProgressForUser)
router.get('/export/:userId', exportSolvedCsv)
router.get('/:userId', getProgressForUser)
router.post('/mark', markProblemCompletion)
router.post('/saveCode', saveProblemCode)

export default router
