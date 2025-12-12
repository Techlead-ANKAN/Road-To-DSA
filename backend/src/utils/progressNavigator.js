export const ensureIndexBoundary = (value) => {
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0) {
    throw Object.assign(new Error('Invalid index value'), { statusCode: 400 })
  }
  return num
}

export const getProgressProblem = (progressDoc, stepIndex, topicIndex, problemIndex) => {
  const step = progressDoc.steps.find((item) => item.step_index === stepIndex)
  if (!step) {
    throw Object.assign(new Error(`Step ${stepIndex} not found`), { statusCode: 404 })
  }

  const topic = step.topics.find((item) => item.topic_index === topicIndex)
  if (!topic) {
    throw Object.assign(new Error(`Topic ${topicIndex} not found in step ${stepIndex}`), { statusCode: 404 })
  }

  const problem = topic.problems[problemIndex]
  if (!problem) {
    throw Object.assign(new Error(`Problem index ${problemIndex} not found`), { statusCode: 404 })
  }

  return { step, topic, problem }
}
