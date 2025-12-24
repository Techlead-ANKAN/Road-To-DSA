import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import courseRoutes from './routes/courseRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import userRoutes from './routes/userRoutes.js'
import interviewQuestionRoutes from './routes/interviewQuestionRoutes.js'
import visualizeRoutes from './routes/visualizeRoutes.js'
import webAssignmentRoutes from './routes/webAssignmentRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import gymRoutes from './routes/gymRoutes.js'
import noticeRoutes from './routes/noticeRoutes.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

export const createApp = () => {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
  }

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/course', courseRoutes)
  app.use('/api/progress', progressRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/interview-questions', interviewQuestionRoutes)
  app.use('/api/visualize', visualizeRoutes)
  app.use('/api/web-assignments', webAssignmentRoutes)
  app.use('/api/tasks', taskRoutes)
  app.use('/api/gym', gymRoutes)
  app.use('/api/notices', noticeRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
