import { Course } from '../models/Course.js'

const fetchCourse = async () => {
  const course = await Course.findOne()
  if (!course) {
    const error = new Error('Course not imported yet')
    error.statusCode = 404
    throw error
  }
  return course
}

export const getCourseOverview = async (req, res) => {
  const course = await fetchCourse()

  const totalProblems = course.steps.reduce((sum, step) => sum + (step.total_problems || 0), 0)

  res.json({
    courseId: course._id,
    course_name: course.course_name,
    description: course.description,
    totalSteps: course.steps.length,
    totalProblems,
    metadata: course.metadata || null,
    summary: course.summary || null,
    statistics: course.statistics || null,
    steps: course.steps.map((step) => ({
      step_index: step.step_index,
      step_name: step.step_name,
      total_problems: step.total_problems || (step.topics?.reduce((topicSum, topic) => topicSum + (topic.problems?.length || 0), 0) || 0)
    }))
  })
}

export const getCourseStep = async (req, res) => {
  const stepIndex = Number(req.params.stepIndex)
  if (Number.isNaN(stepIndex)) {
    const error = new Error('stepIndex must be a number')
    error.statusCode = 400
    throw error
  }

  const course = await fetchCourse()
  const step = course.steps.find((item) => item.step_index === stepIndex)

  if (!step) {
    const error = new Error('Step not found')
    error.statusCode = 404
    throw error
  }

  res.json({
    courseId: course._id,
    step
  })
}
