import { Router } from 'express'
import {
  addProblemRevision,
  exportSolvedCsv,
  getProgressForUser,
  getProblemRevisions,
  initProgressForUser,
  markProblemCompletion,
  saveProblemCode
} from '../controllers/progressController.js'

const router = Router()

router.post('/init', initProgressForUser)
router.get('/export/:userId', exportSolvedCsv)
router.get('/revisions/:userId', getProblemRevisions)
router.get('/:userId', getProgressForUser)
router.post('/mark', markProblemCompletion)
router.post('/saveCode', saveProblemCode)
router.post('/revisions', addProblemRevision)

export default router
