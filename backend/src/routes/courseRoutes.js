import { Router } from 'express'
import { getCourseOverview, getCourseStep } from '../controllers/courseController.js'

const router = Router()

router.get('/', getCourseOverview)
router.get('/:stepIndex', getCourseStep)

export default router
