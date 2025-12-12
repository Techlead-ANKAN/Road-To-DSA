const normalizeDifficulty = (value = '') => value.trim()

const buildCourseCaches = (course) => {
  const difficultyTotals = {}
  const stepTotals = {}
  const problemMap = new Map()
  let totalProblems = 0

  course.steps.forEach((step) => {
    let stepProblemCount = 0

    step.topics.forEach((topic) => {
      topic.problems.forEach((problem, problemIdx) => {
        const difficulty = normalizeDifficulty(problem.difficulty)
        difficultyTotals[difficulty] = (difficultyTotals[difficulty] || 0) + 1
        stepProblemCount += 1
        totalProblems += 1
        problemMap.set(
          `${step.step_index}:${topic.topic_index}:${problemIdx}`,
          {
            step,
            topic,
            problem,
            difficulty
          }
        )
      })
    })

    stepTotals[step.step_index] = stepProblemCount
  })

  return {
    totalProblems,
    difficultyTotals,
    stepTotals,
    problemMap
  }
}

export const computeProgressMetrics = (progressDoc, courseDoc) => {
  if (!progressDoc || !courseDoc) {
    return null
  }

  const { totalProblems, difficultyTotals, stepTotals } = buildCourseCaches(courseDoc)

  const difficultyCompleted = {}
  const stepSummaries = []
  let completedProblems = 0
  let lastCompleted = null

  progressDoc.steps.forEach((step) => {
    const totalInStep = stepTotals[step.step_index] || 0
    let completedInStep = 0

    step.topics.forEach((topic) => {
      topic.problems.forEach((problem) => {
        if (problem.completed) {
          completedInStep += 1
          completedProblems += 1
          const difficulty = normalizeDifficulty(problem.difficulty)
          difficultyCompleted[difficulty] = (difficultyCompleted[difficulty] || 0) + 1

          if (problem.completedAt) {
            if (!lastCompleted || new Date(problem.completedAt) > new Date(lastCompleted.completedAt)) {
              lastCompleted = {
                problem_name: problem.problem_name,
                topic_name: topic.topic_name,
                step_name: step.step_name,
                completedAt: problem.completedAt,
                difficulty
              }
            }
          }
        }
      })
    })

    const completionPercentage = totalInStep
      ? Math.round((completedInStep / totalInStep) * 1000) / 10
      : 0

    stepSummaries.push({
      step_index: step.step_index,
      step_name: step.step_name,
      total: totalInStep,
      completed: completedInStep,
      completionPercentage
    })
  })

  const difficultyBreakdown = Object.entries(difficultyTotals).map(([difficulty, total]) => {
    const completed = difficultyCompleted[difficulty] || 0
    const percentage = total ? Math.round((completed / total) * 1000) / 10 : 0
    return { difficulty, total, completed, percentage }
  })

  const completionPercentage = totalProblems
    ? Math.round((completedProblems / totalProblems) * 1000) / 10
    : 0

  return {
    totalProblems,
    completedProblems,
    remainingProblems: totalProblems - completedProblems,
    completionPercentage,
    steps: stepSummaries.sort((a, b) => a.step_index - b.step_index),
    difficulty: difficultyBreakdown,
    lastCompleted
  }
}
