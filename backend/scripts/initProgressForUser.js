import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../src/config/database.js'
import { Course } from '../src/models/Course.js'
import { Progress } from '../src/models/Progress.js'
import { cloneCourseToProgress } from '../src/utils/cloneCourseToProgress.js'

dotenv.config()

const parseArgs = () => {
  const args = process.argv.slice(2)
  const params = {}
  args.forEach((arg) => {
    const [key, value] = arg.split('=')
    if (key.startsWith('--')) {
      params[key.slice(2)] = value
    }
  })
  return params
}

const resolveCourse = async (courseId) => {
  if (courseId) {
    const course = await Course.findById(courseId)
    if (!course) {
      throw new Error('Course not found for provided courseId')
    }
    return course
  }

  const course = await Course.findOne()
  if (!course) {
    throw new Error('No course found. Run importCourse.js first.')
  }
  return course
}

const main = async () => {
  const { user, course } = parseArgs()
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment')
  }
  if (!user) {
    throw new Error('Please provide --user=<userId>')
  }
  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new Error('userId must be a valid ObjectId')
  }

  await connectDatabase(mongoUri)
  const courseDoc = await resolveCourse(course)

  const existing = await Progress.findOne({ userId: user, courseId: courseDoc._id })
  if (existing) {
    console.log('Progress already exists for this user and course')
    return existing
  }

  const progress = await Progress.create({
    userId: user,
    courseId: courseDoc._id,
    steps: cloneCourseToProgress(courseDoc)
  })

  console.log(`Created progress ${progress._id.toString()} for user ${user}`)
  return progress
}

main()
  .catch((error) => {
    console.error('Failed to initialize progress', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase().catch(() => {})
  })
