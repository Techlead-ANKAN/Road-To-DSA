import { Course } from '../models/Course.js'
import { Progress } from '../models/Progress.js'
import { computeProgressMetrics } from '../utils/progressMetrics.js'
import { cloneCourseToProgress } from '../utils/cloneCourseToProgress.js'
import { ensureIndexBoundary, getProgressProblem } from '../utils/progressNavigator.js'
import { Parser as Json2CsvParser } from 'json2csv'

const resolveCourse = async (courseId) => {
  if (courseId) {
    const course = await Course.findById(courseId)
    if (!course) {
      const error = new Error('Course not found')
      error.statusCode = 404
      throw error
    }
    return course
  }

  const course = await Course.findOne()
  if (!course) {
    const error = new Error('Course not imported yet')
    error.statusCode = 404
    throw error
  }
  return course
}

export const initProgressForUser = async (req, res) => {
  const { userId, courseId } = req.body || {}

  if (!userId) {
    const error = new Error('userId is required')
    error.statusCode = 400
    throw error
  }

  const course = await resolveCourse(courseId)

  const existing = await Progress.findOne({ userId, courseId: course._id })
  if (existing) {
    const metrics = computeProgressMetrics(existing, course)
    return res.json({
      progressId: existing._id,
      alreadyExists: true,
      metrics
    })
  }

  const progress = await Progress.create({
    userId,
    courseId: course._id,
    steps: cloneCourseToProgress(course)
  })

  const metrics = computeProgressMetrics(progress, course)

  res.status(201).json({
    progressId: progress._id,
    metrics
  })
}

export const getProgressForUser = async (req, res) => {
  const { courseId } = req.query
  const { userId } = req.params

  if (!userId) {
    const error = new Error('userId is required')
    error.statusCode = 400
    throw error
  }

  const course = await resolveCourse(courseId)
  const progress = await Progress.findOne({ userId, courseId: course._id })

  if (!progress) {
    const error = new Error('Progress not initialized')
    error.statusCode = 404
    throw error
  }

  const metrics = computeProgressMetrics(progress, course)

  res.json({
    progressId: progress._id,
    userId: progress.userId,
    courseId: progress.courseId,
    metrics,
    steps: progress.steps
  })
}

export const markProblemCompletion = async (req, res) => {
  const { userId, courseId, stepIndex, topicIndex, problemIndex, completed } = req.body || {}

  if (!userId) {
    const error = new Error('userId is required')
    error.statusCode = 400
    throw error
  }

  const course = await resolveCourse(courseId)
  const progress = await Progress.findOne({ userId, courseId: course._id })

  if (!progress) {
    const error = new Error('Progress not initialized')
    error.statusCode = 404
    throw error
  }

  const safeStepIndex = ensureIndexBoundary(stepIndex)
  const safeTopicIndex = ensureIndexBoundary(topicIndex)
  const safeProblemIndex = ensureIndexBoundary(problemIndex)

  const { step, topic, problem } = getProgressProblem(progress, safeStepIndex, safeTopicIndex, safeProblemIndex)

  problem.completed = Boolean(completed)
  problem.completedAt = problem.completed ? new Date() : null

  await progress.save()

  const metrics = computeProgressMetrics(progress, course)

  res.json({
    step_index: step.step_index,
    step_name: step.step_name,
    topic_index: topic.topic_index,
    topic_name: topic.topic_name,
    problem,
    metrics
  })
}

export const saveProblemCode = async (req, res) => {
  const { userId, courseId, stepIndex, topicIndex, problemIndex, code, codeLang, notes } = req.body || {}

  if (!userId) {
    const error = new Error('userId is required')
    error.statusCode = 400
    throw error
  }

  const course = await resolveCourse(courseId)
  const progress = await Progress.findOne({ userId, courseId: course._id })

  if (!progress) {
    const error = new Error('Progress not initialized')
    error.statusCode = 404
    throw error
  }

  const safeStepIndex = ensureIndexBoundary(stepIndex)
  const safeTopicIndex = ensureIndexBoundary(topicIndex)
  const safeProblemIndex = ensureIndexBoundary(problemIndex)

  const { problem } = getProgressProblem(progress, safeStepIndex, safeTopicIndex, safeProblemIndex)

  if (typeof code === 'string') {
    problem.code = code
  }
  if (typeof codeLang === 'string' && codeLang.trim()) {
    problem.codeLang = codeLang.trim()
  }
  if (typeof notes === 'string') {
    problem.notes = notes
  }

  await progress.save()

  res.json({
    problem,
    updatedAt: progress.updatedAt
  })
}

export const exportSolvedCsv = async (req, res) => {
  const { userId } = req.params
  const { courseId } = req.query

  const course = await resolveCourse(courseId)
  const progress = await Progress.findOne({ userId, courseId: course._id })

  if (!progress) {
    const error = new Error('Progress not initialized')
    error.statusCode = 404
    throw error
  }

  const rows = []

  progress.steps.forEach((step) => {
    step.topics.forEach((topic) => {
      topic.problems.forEach((problem) => {
        if (problem.completed) {
          rows.push({
            Step: step.step_name,
            Topic: topic.topic_name,
            Problem: problem.problem_name,
            Difficulty: problem.difficulty,
            LeetCode: problem.leetcode_link,
            CompletedAt: problem.completedAt ? new Date(problem.completedAt).toISOString() : ''
          })
        }
      })
    })
  })

  const parser = new Json2CsvParser({
    fields: ['Step', 'Topic', 'Problem', 'Difficulty', 'LeetCode', 'CompletedAt'],
    withBOM: true
  })

  const csvContent = parser.parse(rows)

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="progress-${userId}.csv"`)
  res.send(csvContent)
}
