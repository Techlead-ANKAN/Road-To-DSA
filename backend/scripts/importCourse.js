import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

import { connectDatabase, disconnectDatabase } from '../src/config/database.js'
import { Course } from '../src/models/Course.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataPath = (filename) => path.resolve(__dirname, '../..', 'data', filename)

const loadJson = async (filename) => {
  const raw = await fs.readFile(dataPath(filename), 'utf-8')
  return JSON.parse(raw)
}

const buildCourseSteps = (structure) => {
  return structure.steps.map((step, stepIdx) => {
    const topics = step.topics.map((topic, topicIdx) => {
      const problems = topic.problems.map((problem, problemIdx) => ({
        problem_index: problemIdx,
        problem_name: problem.problem_name,
        difficulty: problem.difficulty,
        leetcode_link: problem.leetcode_link || ''
      }))

      return {
        topic_index: topicIdx,
        topic_name: topic.topic_name,
        progress: topic.progress || '',
        problems
      }
    })

    const totalProblems = topics.reduce((sum, topic) => sum + topic.problems.length, 0)

    return {
      step_index: stepIdx,
      step_name: step.step_name,
      progress: step.progress || '',
      topics,
      total_problems: totalProblems
    }
  })
}

const main = async () => {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment')
  }

  await connectDatabase(mongoUri)

  const structure = await loadJson('dsa_course_structure.json')
  const summary = await loadJson('dsa_course_summary.json').catch(() => null)
  const statistics = await loadJson('dsa_course_statistics.json').catch(() => null)

  const coursePayload = {
    course_name: structure.course_name,
    description: structure.description,
    steps: buildCourseSteps(structure),
    metadata: summary?.metadata || null,
    summary: summary || null,
    statistics: statistics || null,
    raw_source: structure
  }

  await Course.deleteMany({})
  const course = await Course.create(coursePayload)

  console.log(`Imported course ${course.course_name} with ${course.steps.length} steps`)
}

main()
  .catch((error) => {
    console.error('Failed to import course', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase().catch(() => {})
  })
