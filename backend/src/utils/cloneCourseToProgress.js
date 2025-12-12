export const cloneCourseToProgress = (course) => {
  if (!course) {
    throw new Error('Course not provided')
  }

  return course.steps.map((step) => ({
    step_index: step.step_index,
    step_name: step.step_name,
    topics: step.topics.map((topic) => ({
      topic_index: topic.topic_index,
      topic_name: topic.topic_name,
      problems: topic.problems.map((problem, problemIdx) => ({
        problem_index: problemIdx,
        problem_name: problem.problem_name,
        difficulty: problem.difficulty,
        leetcode_link: problem.leetcode_link || '',
        completed: false,
        completedAt: null,
        code: '',
        codeLang: 'cpp',
        notes: ''
      }))
    }))
  }))
}
